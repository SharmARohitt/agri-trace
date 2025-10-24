import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const farmer = accounts.get("wallet_1")!;
const buyer = accounts.get("wallet_2")!;

describe("PaymentEscrow Contract", () => {
  it("should create escrow successfully", () => {
    const { result } = simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-001"),
        Cl.stringAscii("BATCH-001"),
        Cl.principal(farmer),
        Cl.uint(50000), // 50,000 microSTX
        Cl.uint(1000) // delivery deadline
      ],
      buyer
    );

    expect(result).toBeOk(Cl.stringAscii("ESCROW-001"));
  });

  it("should prevent duplicate escrow IDs", () => {
    // First escrow should succeed
    simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-002"),
        Cl.stringAscii("BATCH-002"),
        Cl.principal(farmer),
        Cl.uint(30000),
        Cl.uint(1000)
      ],
      buyer
    );

    // Duplicate escrow should fail
    const { result } = simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-002"),
        Cl.stringAscii("BATCH-003"),
        Cl.principal(farmer),
        Cl.uint(40000),
        Cl.uint(1000)
      ],
      buyer
    );

    expect(result).toBeErr(Cl.uint(301)); // ERR-ESCROW-EXISTS
  });

  it("should allow buyer to confirm delivery", () => {
    // Create escrow
    simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-003"),
        Cl.stringAscii("BATCH-003"),
        Cl.principal(farmer),
        Cl.uint(60000),
        Cl.uint(1000)
      ],
      buyer
    );

    // Buyer confirms delivery
    const { result } = simnet.callPublicFn(
      "payment-escrow",
      "confirm-delivery",
      [Cl.stringAscii("ESCROW-003")],
      buyer
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should prevent non-buyer from confirming delivery", () => {
    // Create escrow
    simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-004"),
        Cl.stringAscii("BATCH-004"),
        Cl.principal(farmer),
        Cl.uint(45000),
        Cl.uint(1000)
      ],
      buyer
    );

    // Farmer tries to confirm delivery (should fail)
    const { result } = simnet.callPublicFn(
      "payment-escrow",
      "confirm-delivery",
      [Cl.stringAscii("ESCROW-004")],
      farmer
    );

    expect(result).toBeErr(Cl.uint(300)); // ERR-NOT-AUTHORIZED
  });

  it("should allow farmer to confirm delivery completion", () => {
    // Create escrow
    simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-005"),
        Cl.stringAscii("BATCH-005"),
        Cl.principal(farmer),
        Cl.uint(55000),
        Cl.uint(1000)
      ],
      buyer
    );

    // Farmer confirms delivery completion
    const { result } = simnet.callPublicFn(
      "payment-escrow",
      "farmer-confirm-delivery",
      [Cl.stringAscii("ESCROW-005")],
      farmer
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should return escrow details correctly", () => {
    // Create escrow
    simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-006"),
        Cl.stringAscii("BATCH-006"),
        Cl.principal(farmer),
        Cl.uint(70000),
        Cl.uint(1000)
      ],
      buyer
    );

    // Get escrow details
    const { result } = simnet.callReadOnlyFn(
      "payment-escrow",
      "get-escrow",
      [Cl.stringAscii("ESCROW-006")],
      buyer
    );

    expect(result).toBeSome();
  });

  it("should check if escrow exists", () => {
    // Create escrow
    simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-007"),
        Cl.stringAscii("BATCH-007"),
        Cl.principal(farmer),
        Cl.uint(35000),
        Cl.uint(1000)
      ],
      buyer
    );

    // Check if escrow exists
    const existsResult = simnet.callReadOnlyFn(
      "payment-escrow",
      "escrow-exists",
      [Cl.stringAscii("ESCROW-007")],
      buyer
    );

    expect(existsResult.result).toBeBool(true);

    // Check non-existent escrow
    const notExistsResult = simnet.callReadOnlyFn(
      "payment-escrow",
      "escrow-exists",
      [Cl.stringAscii("ESCROW-999")],
      buyer
    );

    expect(notExistsResult.result).toBeBool(false);
  });

  it("should prevent creating escrow with zero amount", () => {
    // Try to create escrow with zero amount
    const { result } = simnet.callPublicFn(
      "payment-escrow",
      "create-escrow",
      [
        Cl.stringAscii("ESCROW-008"),
        Cl.stringAscii("BATCH-008"),
        Cl.principal(farmer),
        Cl.uint(0), // Zero amount
        Cl.uint(1000)
      ],
      buyer
    );

    expect(result).toBeErr(Cl.uint(306)); // ERR-INVALID-AMOUNT
  });
});