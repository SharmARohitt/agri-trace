import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const farmer1 = accounts.get("wallet_1")!;
const farmer2 = accounts.get("wallet_2")!;
const verifier = accounts.get("wallet_3")!;

describe("FarmerRegistry Contract", () => {
  it("should allow farmer registration", () => {
    const { result } = simnet.callPublicFn(
      "farmer-registry",
      "register-farmer",
      [Cl.stringAscii("John Doe"), Cl.stringAscii("California")],
      farmer1
    );

    expect(result).toBeOk(Cl.principal(farmer1));
  });

  it("should prevent duplicate farmer registration", () => {
    // First registration should succeed
    simnet.callPublicFn(
      "farmer-registry",
      "register-farmer",
      [Cl.stringAscii("John Doe"), Cl.stringAscii("California")],
      farmer1
    );

    // Second registration should fail
    const { result } = simnet.callPublicFn(
      "farmer-registry",
      "register-farmer",
      [Cl.stringAscii("John Doe Updated"), Cl.stringAscii("California")],
      farmer1
    );

    expect(result).toBeErr(Cl.uint(101)); // ERR-FARMER-EXISTS
  });

  it("should allow contract owner to add verifiers", () => {
    const { result } = simnet.callPublicFn(
      "farmer-registry",
      "add-verifier",
      [Cl.principal(verifier)],
      deployer
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should prevent non-owner from adding verifiers", () => {
    const { result } = simnet.callPublicFn(
      "farmer-registry",
      "add-verifier",
      [Cl.principal(verifier)],
      farmer1
    );

    expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
  });

  it("should allow authorized verifiers to verify farmers", () => {
    // Register farmer
    simnet.callPublicFn(
      "farmer-registry",
      "register-farmer",
      [Cl.stringAscii("Jane Smith"), Cl.stringAscii("Texas")],
      farmer2
    );

    // Add verifier
    simnet.callPublicFn(
      "farmer-registry",
      "add-verifier",
      [Cl.principal(verifier)],
      deployer
    );

    // Verify farmer
    const { result } = simnet.callPublicFn(
      "farmer-registry",
      "verify-farmer",
      [Cl.principal(farmer2)],
      verifier
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should return farmer details correctly", () => {
    // Register farmer
    simnet.callPublicFn(
      "farmer-registry",
      "register-farmer",
      [Cl.stringAscii("Bob Wilson"), Cl.stringAscii("Oregon")],
      farmer1
    );

    // Get farmer details
    const { result } = simnet.callReadOnlyFn(
      "farmer-registry",
      "get-farmer",
      [Cl.principal(farmer1)],
      farmer1
    );

    expect(result).toBeSome();
  });

  it("should update farmer stats correctly", () => {
    // Register farmer
    simnet.callPublicFn(
      "farmer-registry",
      "register-farmer",
      [Cl.stringAscii("Alice Green"), Cl.stringAscii("Washington")],
      farmer1
    );

    // Update stats
    const { result } = simnet.callPublicFn(
      "farmer-registry",
      "update-farmer-stats",
      [Cl.principal(farmer1), Cl.uint(5), Cl.uint(1000)],
      deployer
    );

    expect(result).toBeOk(Cl.bool(true));

    // Check updated stats
    const statsResult = simnet.callReadOnlyFn(
      "farmer-registry",
      "get-farmer-stats",
      [Cl.principal(farmer1)],
      farmer1
    );

    expect(statsResult.result).toBeSome();
  });
});