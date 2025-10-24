;; PaymentEscrow Contract
;; Manages STX escrow payments between buyers and farmers

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u300))
(define-constant ERR-ESCROW-EXISTS (err u301))
(define-constant ERR-ESCROW-NOT-FOUND (err u302))
(define-constant ERR-INSUFFICIENT-FUNDS (err u303))
(define-constant ERR-ESCROW-ALREADY-COMPLETED (err u304))
(define-constant ERR-BATCH-NOT-FOUND (err u305))
(define-constant ERR-INVALID-AMOUNT (err u306))

;; Escrow status constants
(define-constant ESCROW-PENDING u1)
(define-constant ESCROW-CONFIRMED u2)
(define-constant ESCROW-RELEASED u3)
(define-constant ESCROW-REFUNDED u4)

;; Contract references will be set during deployment
;; For local testing, these will be the deployed contract addresses

;; Data structures
(define-map escrows
  { escrow-id: (string-ascii 50) }
  {
    batch-id: (string-ascii 50),
    buyer: principal,
    farmer: principal,
    amount: uint,
    status: uint,
    created-at: uint,
    delivery-deadline: uint,
    confirmation-required: bool,
    buyer-confirmed: bool,
    farmer-confirmed: bool
  }
)

(define-map escrow-funds
  { escrow-id: (string-ascii 50) }
  { locked-amount: uint }
)

;; Public functions

;; Create escrow for a product batch
(define-public (create-escrow 
  (escrow-id (string-ascii 50))
  (batch-id (string-ascii 50))
  (farmer principal)
  (amount uint)
  (delivery-deadline uint))
  
  (let ((buyer tx-sender))
        ;; For now, we'll validate batch exists by checking if batch-id is not empty
        ;; In production, this would call the product-tracking contract
    
    ;; Validate inputs
    (asserts! (is-none (map-get? escrows { escrow-id: escrow-id })) ERR-ESCROW-EXISTS)
    (asserts! (> amount u0) ERR-INVALID-AMOUNT)
    ;; Validate batch-id is not empty (simplified validation)
    (asserts! (> (len batch-id) u0) ERR-BATCH-NOT-FOUND)
    (asserts! (> delivery-deadline stacks-block-height) ERR-INVALID-AMOUNT)
    
    ;; Check buyer has sufficient funds
    (asserts! (>= (stx-get-balance buyer) amount) ERR-INSUFFICIENT-FUNDS)
    
    ;; Transfer STX to contract for escrow
    (try! (stx-transfer? amount buyer (as-contract tx-sender)))
    
    ;; Create escrow record
    (map-set escrows
      { escrow-id: escrow-id }
      {
        batch-id: batch-id,
        buyer: buyer,
        farmer: farmer,
        amount: amount,
        status: ESCROW-PENDING,
        created-at: stacks-block-height,
        delivery-deadline: delivery-deadline,
        confirmation-required: true,
        buyer-confirmed: false,
        farmer-confirmed: false
      }
    )
    
    ;; Lock funds
    (map-set escrow-funds { escrow-id: escrow-id } { locked-amount: amount })
    
    (print { 
      event: "escrow-created", 
      escrow-id: escrow-id, 
      batch-id: batch-id,
      buyer: buyer,
      farmer: farmer,
      amount: amount 
    })
    (ok escrow-id)
  )
)

;; Buyer confirms delivery
(define-public (confirm-delivery (escrow-id (string-ascii 50)))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get buyer escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status escrow) ESCROW-PENDING) ERR-ESCROW-ALREADY-COMPLETED)
    
    ;; Update buyer confirmation
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { buyer-confirmed: true })
    )
    
    ;; Check if both parties confirmed or only buyer confirmation needed
    (let ((updated-escrow (unwrap-panic (map-get? escrows { escrow-id: escrow-id }))))
      (if (or (not (get confirmation-required updated-escrow)) 
              (and (get buyer-confirmed updated-escrow) (get farmer-confirmed updated-escrow)))
        (release-payment-internal escrow-id)
        (ok true)
      )
    )
  )
)

;; Farmer confirms delivery completion
(define-public (farmer-confirm-delivery (escrow-id (string-ascii 50)))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get farmer escrow)) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status escrow) ESCROW-PENDING) ERR-ESCROW-ALREADY-COMPLETED)
    
    ;; Update farmer confirmation
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { farmer-confirmed: true })
    )
    
    ;; Check if both parties confirmed
    (let ((updated-escrow (unwrap-panic (map-get? escrows { escrow-id: escrow-id }))))
      (if (and (get buyer-confirmed updated-escrow) (get farmer-confirmed updated-escrow))
        (release-payment-internal escrow-id)
        (ok true)
      )
    )
  )
)

;; Release payment to farmer (automatic after confirmations)
(define-public (release-payment (escrow-id (string-ascii 50)))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND)))
    ;; Only allow if deadline passed and buyer confirmed, or both parties confirmed
    (asserts! (or 
      (and (get buyer-confirmed escrow) (> stacks-block-height (get delivery-deadline escrow)))
      (and (get buyer-confirmed escrow) (get farmer-confirmed escrow))
    ) ERR-NOT-AUTHORIZED)
    
    (release-payment-internal escrow-id)
  )
)

;; Refund payment to buyer (if delivery failed)
(define-public (refund-payment (escrow-id (string-ascii 50)))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND)))
    ;; Only allow refund if deadline passed and buyer didn't confirm
    (asserts! (and 
      (> stacks-block-height (get delivery-deadline escrow))
      (not (get buyer-confirmed escrow))
    ) ERR-NOT-AUTHORIZED)
    (asserts! (is-eq (get status escrow) ESCROW-PENDING) ERR-ESCROW-ALREADY-COMPLETED)
    
    ;; Transfer funds back to buyer
    (try! (as-contract (stx-transfer? (get amount escrow) tx-sender (get buyer escrow))))
    
    ;; Update escrow status
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { status: ESCROW-REFUNDED })
    )
    
    (print { event: "payment-refunded", escrow-id: escrow-id, amount: (get amount escrow) })
    (ok true)
  )
)

;; Private functions

;; Internal function to release payment
(define-private (release-payment-internal (escrow-id (string-ascii 50)))
  (let ((escrow (unwrap! (map-get? escrows { escrow-id: escrow-id }) ERR-ESCROW-NOT-FOUND)))
    (asserts! (is-eq (get status escrow) ESCROW-PENDING) ERR-ESCROW-ALREADY-COMPLETED)
    
    ;; Transfer funds to farmer
    (try! (as-contract (stx-transfer? (get amount escrow) tx-sender (get farmer escrow))))
    
    ;; Update escrow status
    (map-set escrows
      { escrow-id: escrow-id }
      (merge escrow { status: ESCROW-RELEASED })
    )
    
    ;; Update farmer revenue stats would be called here in production
    ;; (try! (contract-call? .farmer-registry update-farmer-stats 
    ;;   (get farmer escrow) u0 (get amount escrow)))
    
    (print { 
      event: "payment-released", 
      escrow-id: escrow-id, 
      farmer: (get farmer escrow),
      amount: (get amount escrow) 
    })
    (ok true)
  )
)

;; Read-only functions

;; Get escrow details
(define-read-only (get-escrow (escrow-id (string-ascii 50)))
  (map-get? escrows { escrow-id: escrow-id })
)

;; Get locked funds amount
(define-read-only (get-locked-funds (escrow-id (string-ascii 50)))
  (map-get? escrow-funds { escrow-id: escrow-id })
)

;; Check if escrow exists
(define-read-only (escrow-exists (escrow-id (string-ascii 50)))
  (is-some (map-get? escrows { escrow-id: escrow-id }))
)

;; Get escrow status name
(define-read-only (get-escrow-status-name (status uint))
  (if (is-eq status ESCROW-PENDING) "Pending"
    (if (is-eq status ESCROW-CONFIRMED) "Confirmed"
      (if (is-eq status ESCROW-RELEASED) "Released"
        (if (is-eq status ESCROW-REFUNDED) "Refunded"
          "Unknown"
        )
      )
    )
  )
)

;; Check if escrow is ready for release
(define-read-only (is-ready-for-release (escrow-id (string-ascii 50)))
  (match (map-get? escrows { escrow-id: escrow-id })
    escrow (and 
      (is-eq (get status escrow) ESCROW-PENDING)
      (or 
        (and (get buyer-confirmed escrow) (get farmer-confirmed escrow))
        (and (get buyer-confirmed escrow) (> stacks-block-height (get delivery-deadline escrow)))
      )
    )
    false
  )
)