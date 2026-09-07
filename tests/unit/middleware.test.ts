import { NextRequest } from "next/server";
import { middleware } from "../../src/middleware";

async function testMiddlewareLogic() {
  console.log("=== Starting RBAC Edge Middleware Unit Tests ===");

  try {
    // TC-104.3: Anonymous visitor requesting /admin redirects to /login?callbackUrl=/admin
    console.log("Testing TC-104.3: Anonymous visitor accessing /admin redirects to /login...");
    const reqAdminAnon = new NextRequest("http://localhost:3000/admin");
    const resAdminAnon = await middleware(reqAdminAnon);

    if (resAdminAnon.status !== 307) {
      throw new Error(`FAILED: Expected redirect status 307, got ${resAdminAnon.status}`);
    }
    const location = resAdminAnon.headers.get("location");
    if (!location || !location.includes("/login?callbackUrl=%2Fadmin")) {
      throw new Error(`FAILED: Redirect location mismatch: ${location}`);
    }
    console.log("✔ TC-104.3 PASSED: Anonymous request redirected to:", location);

    // TC-104.5: Anonymous request to /api/admin/metrics returns 401 Unauthorized
    console.log("Testing TC-104.5: Anonymous request to /api/admin/metrics returns 401...");
    const reqApiAnon = new NextRequest("http://localhost:3000/api/admin/metrics");
    const resApiAnon = await middleware(reqApiAnon);

    if (resApiAnon.status !== 401) {
      throw new Error(`FAILED: Expected 401 Unauthorized, got ${resApiAnon.status}`);
    }
    const apiJson = await resApiAnon.json();
    if (!apiJson.error || !apiJson.error.includes("Unauthorized")) {
      throw new Error(`FAILED: Expected Unauthorized error payload, got ${JSON.stringify(apiJson)}`);
    }
    console.log("✔ TC-104.5 PASSED: Anonymous API call blocked with 401:", apiJson);

    console.log("\n========================================================");
    console.log(" ALL MIDDLEWARE REDIRECT & GUARD UNIT TESTS PASSED!");
    console.log("========================================================\n");
  } catch (error) {
    console.error("Test Suite Failure:", error);
    process.exit(1);
  }
}

testMiddlewareLogic();
