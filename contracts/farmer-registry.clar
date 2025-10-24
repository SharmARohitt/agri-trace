;; FarmerRegistry Contract
;; Manages farmer registration, verification, and profile data

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-FARMER-EXISTS (err u101))
(define-constant ERR-FARMER-NOT-FOUND (err u102))
(define-constant ERR-INVALID-REGION (err u103))

;; Contract owner
(define-constant CONTRACT-OWNER tx-sender)

;; Data structures
(define-map farmers
  { farmer-id: principal }
  {
    name: (string-ascii 100),
    region: (string-ascii 50),
    wallet-address: principal,
    verified: bool,
    registration-block: uint,
    verifier: (optional principal)
  }
)

(define-map farmer-stats
  { farmer-id: principal }
  {
    total-batches: uint,
    total-revenue: uint,
    reputation-score: uint
  }
)

;; Verification authorities (government/NGO addresses)
(define-map verifiers
  { verifier: principal }
  { authorized: bool }
)

;; Public functions

;; Register a new farmer
(define-public (register-farmer (name (string-ascii 100)) (region (string-ascii 50)))
  (let ((farmer-id tx-sender))
    (asserts! (is-none (map-get? farmers { farmer-id: farmer-id })) ERR-FARMER-EXISTS)
    (asserts! (> (len name) u0) ERR-INVALID-REGION)
    (asserts! (> (len region) u0) ERR-INVALID-REGION)
    
    (map-set farmers
      { farmer-id: farmer-id }
      {
        name: name,
        region: region,
        wallet-address: farmer-id,
        verified: false,
        registration-block: stacks-block-height,
        verifier: none
      }
    )
    
    (map-set farmer-stats
      { farmer-id: farmer-id }
      {
        total-batches: u0,
        total-revenue: u0,
        reputation-score: u100
      }
    )
    
    (print { event: "farmer-registered", farmer-id: farmer-id, name: name, region: region })
    (ok farmer-id)
  )
)

;; Verify a farmer (only authorized verifiers)
(define-public (verify-farmer (farmer-id principal))
  (let ((verifier tx-sender))
    (asserts! (default-to false (get authorized (map-get? verifiers { verifier: verifier }))) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (map-get? farmers { farmer-id: farmer-id })) ERR-FARMER-NOT-FOUND)
    
    (map-set farmers
      { farmer-id: farmer-id }
      (merge (unwrap-panic (map-get? farmers { farmer-id: farmer-id }))
        { verified: true, verifier: (some verifier) }
      )
    )
    
    (print { event: "farmer-verified", farmer-id: farmer-id, verifier: verifier })
    (ok true)
  )
)

;; Add authorized verifier (only contract owner)
(define-public (add-verifier (verifier principal))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (map-set verifiers { verifier: verifier } { authorized: true })
    (print { event: "verifier-added", verifier: verifier })
    (ok true)
  )
)

;; Update farmer stats (called by other contracts)
(define-public (update-farmer-stats (farmer-id principal) (batches-increment uint) (revenue-increment uint))
  (let ((current-stats (default-to { total-batches: u0, total-revenue: u0, reputation-score: u100 }
                                   (map-get? farmer-stats { farmer-id: farmer-id }))))
    (map-set farmer-stats
      { farmer-id: farmer-id }
      {
        total-batches: (+ (get total-batches current-stats) batches-increment),
        total-revenue: (+ (get total-revenue current-stats) revenue-increment),
        reputation-score: (get reputation-score current-stats)
      }
    )
    (ok true)
  )
)

;; Read-only functions

;; Get farmer details
(define-read-only (get-farmer (farmer-id principal))
  (map-get? farmers { farmer-id: farmer-id })
)

;; Get farmer stats
(define-read-only (get-farmer-stats (farmer-id principal))
  (map-get? farmer-stats { farmer-id: farmer-id })
)

;; Check if farmer is verified
(define-read-only (is-farmer-verified (farmer-id principal))
  (default-to false (get verified (map-get? farmers { farmer-id: farmer-id })))
)

;; Check if address is authorized verifier
(define-read-only (is-authorized-verifier (verifier principal))
  (default-to false (get authorized (map-get? verifiers { verifier: verifier })))
)

;; Get contract owner
(define-read-only (get-contract-owner)
  CONTRACT-OWNER
)