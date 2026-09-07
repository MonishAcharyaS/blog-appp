import { authOptions } from "../../src/lib/auth";
import { prisma } from "../../src/lib/prisma";
import bcrypt from "bcryptjs";

async function runAuthTests() {
  console.log("=== Starting NextAuth & Password Hashing Unit / Integration Tests ===");

  try {
    const credentialsProvider = authOptions.providers.find(
      (p) => p.id === "credentials" || p.name === "Credentials"
    );
    const provider = credentialsProvider as unknown as {
      options?: { authorize?: (c?: Record<string, string>) => Promise<unknown> };
      authorize?: (c?: Record<string, string>) => Promise<unknown>;
    };
    const authorize = (provider.options?.authorize ?? provider.authorize) as (
      credentials?: Record<string, string>
    ) => Promise<{ id: string; role: string; email: string } | null>;

    // TC-103.1: Valid Admin credentials return session user with role: 'ADMIN'
    console.log("Testing TC-103.1: Valid Admin credentials authorize...");
    const adminUser = await authorize({
      email: "admin@example.com",
      password: "Admin123!",
    });
    if (!adminUser || adminUser.role !== "ADMIN" || adminUser.email !== "admin@example.com") {
      throw new Error(`FAILED: TC-103.1 Admin user authorize returned unexpected result: ${JSON.stringify(adminUser)}`);
    }
    console.log("✔ TC-103.1 PASSED: Admin authenticated with role ADMIN.");

    // TC-103.2: Valid Reader credentials return session user with role: 'READER'
    console.log("Testing TC-103.2: Valid Reader credentials authorize...");
    const readerUser = await authorize({
      email: "jane@example.com",
      password: "Reader123!",
    });
    if (!readerUser || readerUser.role !== "READER" || readerUser.email !== "jane@example.com") {
      throw new Error(`FAILED: TC-103.2 Reader user authorize returned unexpected result: ${JSON.stringify(readerUser)}`);
    }
    console.log("✔ TC-103.2 PASSED: Reader authenticated with role READER.");

    // TC-103.3: JWT and Session callbacks correctly inject role, id, isBanned
    console.log("Testing TC-103.3: JWT and Session callbacks injection...");
    if (authOptions.callbacks?.jwt && authOptions.callbacks?.session) {
      const mockToken = await authOptions.callbacks.jwt({
        token: {},
        user: adminUser as unknown as import("next-auth").User,
        account: null,
      });
      if (mockToken.id !== adminUser.id || mockToken.role !== "ADMIN") {
        throw new Error(`FAILED: JWT callback did not inject id or role: ${JSON.stringify(mockToken)}`);
      }

      const mockSession = await authOptions.callbacks.session({
        session: {
          user: { name: "", email: "", image: "", id: "", role: "", isBanned: false },
          expires: "",
        },
        token: mockToken,
        user: { emailVerified: null } as unknown as import("next-auth/adapters").AdapterUser,
        newSession: undefined,
        trigger: undefined as unknown as "update",
      });

      const sessionUser = mockSession.user as { id?: string; role?: string };
      if (
        sessionUser?.id !== adminUser.id ||
        sessionUser?.role !== "ADMIN"
      ) {
        throw new Error(`FAILED: Session callback did not inject role or id: ${JSON.stringify(mockSession)}`);
      }
      console.log("✔ TC-103.3 PASSED: JWT and session callbacks successfully inject id and role.");
    }

    // TC-103.4: Unregistered email returns error
    console.log("Testing TC-103.4: Unregistered email rejects authorize...");
    let unregisteredFailed = false;
    try {
      await authorize({
        email: "nonexistent@example.com",
        password: "Password123!",
      });
    } catch (err: unknown) {
      unregisteredFailed = true;
      console.log("✔ Caught expected error for unregistered email:", (err as Error).message);
    }
    if (!unregisteredFailed) {
      throw new Error("FAILED: TC-103.4 Unregistered email did not throw authorization error!");
    }

    // TC-103.5: Incorrect password returns error
    console.log("Testing TC-103.5: Incorrect password rejects authorize...");
    let wrongPasswordFailed = false;
    try {
      await authorize({
        email: "admin@example.com",
        password: "WrongPassword999!",
      });
    } catch (err: unknown) {
      wrongPasswordFailed = true;
      console.log("✔ Caught expected error for incorrect password:", (err as Error).message);
    }
    if (!wrongPasswordFailed) {
      throw new Error("FAILED: TC-103.5 Incorrect password did not throw authorization error!");
    }

    // TC-103.6: Banned user login returns Account suspended error
    console.log("Testing TC-103.6: Banned user rejection...");
    // Create a temporary banned user
    const bannedPasswordHash = await bcrypt.hash("Banned123!", 10);
    await prisma.user.upsert({
      where: { email: "banned@example.com" },
      update: { isBanned: true, passwordHash: bannedPasswordHash },
      create: {
        email: "banned@example.com",
        name: "Banned User",
        passwordHash: bannedPasswordHash,
        role: "READER",
        isBanned: true,
      },
    });

    let bannedUserFailed = false;
    try {
      await authorize({
        email: "banned@example.com",
        password: "Banned123!",
      });
    } catch (err: unknown) {
      if ((err as Error).message === "Account suspended") {
        bannedUserFailed = true;
        console.log("✔ Caught expected 'Account suspended' error for banned user.");
      } else {
        throw err;
      }
    }
    if (!bannedUserFailed) {
      throw new Error("FAILED: TC-103.6 Banned user was not rejected with 'Account suspended'!");
    }

    console.log("\n========================================================");
    console.log(" ALL NEXTAUTH INTEGRATION TEST CASES (TC-103.1 - 103.6) PASSED!");
    console.log("========================================================\n");
  } catch (error) {
    console.error("Test Suite Failure:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runAuthTests();
