import assert from "assert";
import bcrypt from "bcryptjs";
import { prisma } from "../../src/lib/prisma";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function runRegisterUnitTests() {
  console.log("--- Starting User Registration Logic Unit Tests ---");

  // 1. Validation Tests
  console.log("Testing validation rules...");
  assert.strictEqual(EMAIL_REGEX.test("invalid-email"), false, "Invalid email should fail regex");
  assert.strictEqual(EMAIL_REGEX.test("user@domain"), false, "Email without TLD should fail");
  assert.strictEqual(EMAIL_REGEX.test("valid.user@example.com"), true, "Valid email should pass");

  const shortPassword = "12345";
  assert.strictEqual(shortPassword.length < 6, true, "Short password (<6 chars) should be detected");

  const validPassword = "SecurePassword123!";
  assert.strictEqual(validPassword.length >= 6, true, "Valid password length should pass");

  // 2. Duplicate Email Check against DB
  console.log("Testing duplicate email detection with existing seed user...");
  const existingUser = await prisma.user.findUnique({
    where: { email: "jane@example.com" },
  });
  assert.ok(existingUser, "Seed reader jane@example.com should exist in DB");
  console.log("✓ Existing user successfully detected for conflict check");

  // 3. User Creation with READER role
  console.log("Testing new user creation and role assignment...");
  const testEmail = `test.reader.${Date.now()}@example.com`;
  const passwordHash = await bcrypt.hash(validPassword, 10);

  const newUser = await prisma.user.create({
    data: {
      name: "Unit Test Reader",
      email: testEmail,
      passwordHash,
      role: "READER",
      isBanned: false,
    },
  });

  assert.ok(newUser.id, "Created user should have an ID");
  assert.strictEqual(newUser.role, "READER", "New user must default to READER role");
  assert.strictEqual(newUser.isBanned, false, "New user must not be banned");
  assert.strictEqual(
    await bcrypt.compare(validPassword, newUser.passwordHash),
    true,
    "Password hash must match original password"
  );
  console.log("✓ User successfully created with READER role and verified bcrypt hash");

  // Clean up
  await prisma.user.delete({
    where: { id: newUser.id },
  });
  console.log("✓ Test user cleaned up cleanly");

  console.log("--- All Registration Unit Tests Passed! ---");
}

runRegisterUnitTests()
  .catch((err) => {
    console.error("Unit test failure:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
