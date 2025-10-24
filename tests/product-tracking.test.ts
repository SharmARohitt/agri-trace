import { describe, expect, it, beforeEach } from "vitest";
import { Cl } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const farmer1 = accounts.get("wallet_1")!;
const transporter = accounts.get("wallet_2")!;

describe("ProductTracking Contract", () => {
  it("should allow product batch recording", () => {
    const { result } = simnet.callPublicFn(
      "product-tracking",
      "record-batch",
      [
        Cl.stringAscii("BATCH-001"),
        Cl.stringAscii("Tomatoes"),
        Cl.uint(100),
        Cl.stringAscii("kg"),
        Cl.uint(500), // price per unit
        Cl.stringAscii("A"),
        Cl.uint(1000), // harvest date
        Cl.uint(2000), // expiry date
        Cl.stringAscii("Farm Location")
      ],
      farmer1
    );

    expect(result).toBeOk(Cl.stringAscii("BATCH-001"));
  });

  it("should prevent duplicate batch IDs", () => {
    // First batch should succeed
    simnet.callPublicFn(
      "product-tracking",
      "record-batch",
      [
        Cl.stringAscii("BATCH-002"),
        Cl.stringAscii("Wheat"),
        Cl.uint(200),
        Cl.stringAscii("kg"),
        Cl.uint(300),
        Cl.stringAscii("B"),
        Cl.uint(1000),
        Cl.uint(2000),
        Cl.stringAscii("Farm Location")
      ],
      farmer1
    );

    // Duplicate batch should fail
    const { result } = simnet.callPublicFn(
      "product-tracking",
      "record-batch",
      [
        Cl.stringAscii("BATCH-002"),
        Cl.stringAscii("Corn"),
        Cl.uint(150),
        Cl.stringAscii("kg"),
        Cl.uint(400),
        Cl.stringAscii("A"),
        Cl.uint(1000),
        Cl.uint(2000),
        Cl.stringAscii("Farm Location")
      ],
      farmer1
    );

    expect(result).toBeErr(Cl.uint(201)); // ERR-BATCH-EXISTS
  });

  it("should allow status updates", () => {
    // Record batch first
    simnet.callPublicFn(
      "product-tracking",
      "record-batch",
      [
        Cl.stringAscii("BATCH-003"),
        Cl.stringAscii("Carrots"),
        Cl.uint(75),
        Cl.stringAscii("kg"),
        Cl.uint(600),
        Cl.stringAscii("A"),
        Cl.uint(1000),
        Cl.uint(2000),
        Cl.stringAscii("Farm Location")
      ],
      farmer1
    );

    // Update status to transported
    const { result } = simnet.callPublicFn(
      "product-tracking",
      "update-status",
      [
        Cl.stringAscii("BATCH-003"),
        Cl.uint(2), // STATUS-TRANSPORTED
        Cl.stringAscii("Transport Hub"),
        Cl.stringAscii("In transit to warehouse"),
        Cl.some(Cl.int(5)), // temperature
        Cl.some(Cl.uint(60)) // humidity
      ],
      transporter
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should prevent invalid status transitions", () => {
    // Record batch
    simnet.callPublicFn(
      "product-tracking",
      "record-batch",
      [
        Cl.stringAscii("BATCH-004"),
        Cl.stringAscii("Apples"),
        Cl.uint(50),
        Cl.stringAscii("kg"),
        Cl.uint(800),
        Cl.stringAscii("A"),
        Cl.uint(1000),
        Cl.uint(2000),
        Cl.stringAscii("Farm Location")
      ],
      farmer1
    );

    // Try to jump from PRODUCED (1) to SOLD (4) - should fail
    const { result } = simnet.callPublicFn(
      "product-tracking",
      "update-status",
      [
        Cl.stringAscii("BATCH-004"),
        Cl.uint(4), // STATUS-SOLD
        Cl.stringAscii("Store"),
        Cl.stringAscii("Sold to consumer"),
        Cl.none(),
        Cl.none()
      ],
      transporter
    );

    expect(result).toBeErr(Cl.uint(203)); // ERR-INVALID-STATUS
  });

  it("should return batch details correctly", () => {
    // Record batch
    simnet.callPublicFn(
      "product-tracking",
      "record-batch",
      [
        Cl.stringAscii("BATCH-005"),
        Cl.stringAscii("Potatoes"),
        Cl.uint(120),
        Cl.stringAscii("kg"),
        Cl.uint(400),
        Cl.stringAscii("B"),
        Cl.uint(1000),
        Cl.uint(2000),
        Cl.stringAscii("Farm Location")
      ],
      farmer1
    );

    // Get batch details
    const { result } = simnet.callReadOnlyFn(
      "product-tracking",
      "get-batch",
      [Cl.stringAscii("BATCH-005")],
      farmer1
    );

    expect(result).toBeSome();
  });

  it("should track batch event count", () => {
    // Record batch
    simnet.callPublicFn(
      "product-tracking",
      "record-batch",
      [
        Cl.stringAscii("BATCH-006"),
        Cl.stringAscii("Onions"),
        Cl.uint(80),
        Cl.stringAscii("kg"),
        Cl.uint(350),
        Cl.stringAscii("A"),
        Cl.uint(1000),
        Cl.uint(2000),
        Cl.stringAscii("Farm Location")
      ],
      farmer1
    );

    // Check initial event count (should be 1 after recording)
    const { result } = simnet.callReadOnlyFn(
      "product-tracking",
      "get-batch-event-count",
      [Cl.stringAscii("BATCH-006")],
      farmer1
    );

    expect(result).toBeUint(1);
  });
});