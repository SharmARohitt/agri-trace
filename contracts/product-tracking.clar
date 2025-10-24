;; ProductTracking Contract
;; Tracks product batches through the supply chain with immutable history

;; Error constants
(define-constant ERR-NOT-AUTHORIZED (err u200))
(define-constant ERR-BATCH-EXISTS (err u201))
(define-constant ERR-BATCH-NOT-FOUND (err u202))
(define-constant ERR-INVALID-STATUS (err u203))
(define-constant ERR-FARMER-NOT-VERIFIED (err u204))

;; Status constants
(define-constant STATUS-PRODUCED u1)
(define-constant STATUS-TRANSPORTED u2)
(define-constant STATUS-STORED u3)
(define-constant STATUS-SOLD u4)

;; Contract references will be set during deployment

;; Data structures
(define-map product-batches
  { batch-id: (string-ascii 50) }
  {
    farmer-id: principal,
    product-type: (string-ascii 50),
    quantity: uint,
    unit: (string-ascii 20),
    created-at: uint,
    current-status: uint,
    current-holder: principal,
    price-per-unit: uint,
    quality-grade: (string-ascii 10),
    harvest-date: uint,
    expiry-date: uint
  }
)

(define-map batch-history
  { batch-id: (string-ascii 50), event-id: uint }
  {
    status: uint,
    timestamp: uint,
    actor: principal,
    location: (string-ascii 100),
    notes: (string-ascii 200),
    temperature: (optional int),
    humidity: (optional uint)
  }
)

(define-map batch-event-count
  { batch-id: (string-ascii 50) }
  { count: uint }
)

;; Public functions

;; Record a new product batch (only verified farmers)
(define-public (record-batch 
  (batch-id (string-ascii 50))
  (product-type (string-ascii 50))
  (quantity uint)
  (unit (string-ascii 20))
  (price-per-unit uint)
  (quality-grade (string-ascii 10))
  (harvest-date uint)
  (expiry-date uint)
  (location (string-ascii 100)))
  
  (let ((farmer-id tx-sender))
    ;; Verify farmer exists (simplified - in production would call farmer-registry)
    ;; (asserts! (contract-call? .farmer-registry is-farmer-verified farmer-id) ERR-FARMER-NOT-VERIFIED)
    (asserts! (is-none (map-get? product-batches { batch-id: batch-id })) ERR-BATCH-EXISTS)
    (asserts! (> quantity u0) ERR-INVALID-STATUS)
    
    ;; Create batch record
    (map-set product-batches
      { batch-id: batch-id }
      {
        farmer-id: farmer-id,
        product-type: product-type,
        quantity: quantity,
        unit: unit,
        created-at: stacks-block-height,
        current-status: STATUS-PRODUCED,
        current-holder: farmer-id,
        price-per-unit: price-per-unit,
        quality-grade: quality-grade,
        harvest-date: harvest-date,
        expiry-date: expiry-date
      }
    )
    
    ;; Initialize event count
    (map-set batch-event-count { batch-id: batch-id } { count: u0 })
    
    ;; Record initial event
    (unwrap-panic (add-batch-event batch-id STATUS-PRODUCED farmer-id location "Batch produced and recorded" none none))
    
    ;; Update farmer stats would be called here in production
    ;; (try! (contract-call? .farmer-registry update-farmer-stats farmer-id u1 u0))
    
    (print { 
      event: "batch-recorded", 
      batch-id: batch-id, 
      farmer-id: farmer-id, 
      product-type: product-type,
      quantity: quantity 
    })
    (ok batch-id)
  )
)

;; Update batch status (transportation, storage, sale)
(define-public (update-status 
  (batch-id (string-ascii 50))
  (new-status uint)
  (location (string-ascii 100))
  (notes (string-ascii 200))
  (temperature (optional int))
  (humidity (optional uint)))
  
  (let ((batch (unwrap! (map-get? product-batches { batch-id: batch-id }) ERR-BATCH-NOT-FOUND))
        (current-status (get current-status batch)))
    
    ;; Validate status progression
    (asserts! (and (>= new-status STATUS-PRODUCED) (<= new-status STATUS-SOLD)) ERR-INVALID-STATUS)
    (asserts! (> new-status current-status) ERR-INVALID-STATUS)
    
    ;; Update batch status
    (map-set product-batches
      { batch-id: batch-id }
      (merge batch { current-status: new-status, current-holder: tx-sender })
    )
    
    ;; Add event to history
    (unwrap-panic (add-batch-event batch-id new-status tx-sender location notes temperature humidity))
    
    (print { 
      event: "status-updated", 
      batch-id: batch-id, 
      new-status: new-status, 
      actor: tx-sender 
    })
    (ok true)
  )
)

;; Transfer batch ownership
(define-public (transfer-batch (batch-id (string-ascii 50)) (new-holder principal))
  (let ((batch (unwrap! (map-get? product-batches { batch-id: batch-id }) ERR-BATCH-NOT-FOUND)))
    (asserts! (is-eq tx-sender (get current-holder batch)) ERR-NOT-AUTHORIZED)
    
    (map-set product-batches
      { batch-id: batch-id }
      (merge batch { current-holder: new-holder })
    )
    
    (print { event: "batch-transferred", batch-id: batch-id, from: tx-sender, to: new-holder })
    (ok true)
  )
)

;; Private functions

;; Add event to batch history
(define-private (add-batch-event 
  (batch-id (string-ascii 50))
  (status uint)
  (actor principal)
  (location (string-ascii 100))
  (notes (string-ascii 200))
  (temperature (optional int))
  (humidity (optional uint)))
  
  (let ((current-count (default-to u0 (get count (map-get? batch-event-count { batch-id: batch-id }))))
        (event-id (+ current-count u1)))
    
    (map-set batch-history
      { batch-id: batch-id, event-id: event-id }
      {
        status: status,
        timestamp: stacks-block-height,
        actor: actor,
        location: location,
        notes: notes,
        temperature: temperature,
        humidity: humidity
      }
    )
    
    (map-set batch-event-count { batch-id: batch-id } { count: event-id })
    (ok event-id)
  )
)

;; Read-only functions

;; Get batch details
(define-read-only (get-batch (batch-id (string-ascii 50)))
  (map-get? product-batches { batch-id: batch-id })
)

;; Get batch history event
(define-read-only (get-batch-event (batch-id (string-ascii 50)) (event-id uint))
  (map-get? batch-history { batch-id: batch-id, event-id: event-id })
)

;; Get batch event count
(define-read-only (get-batch-event-count (batch-id (string-ascii 50)))
  (default-to u0 (get count (map-get? batch-event-count { batch-id: batch-id })))
)

;; Get full batch history
(define-read-only (get-batch-history (batch-id (string-ascii 50)))
  (let ((event-count (get-batch-event-count batch-id)))
    (map get-batch-event-by-id (list u1 u2 u3 u4 u5 u6 u7 u8 u9 u10))
  )
)

;; Helper function for batch history
(define-read-only (get-batch-event-by-id (event-id uint))
  (get-batch-event "default" event-id)
)

;; Check if batch exists
(define-read-only (batch-exists (batch-id (string-ascii 50)))
  (is-some (map-get? product-batches { batch-id: batch-id }))
)

;; Get status name
(define-read-only (get-status-name (status uint))
  (if (is-eq status STATUS-PRODUCED) "Produced"
    (if (is-eq status STATUS-TRANSPORTED) "In Transit"
      (if (is-eq status STATUS-STORED) "In Storage"
        (if (is-eq status STATUS-SOLD) "Sold"
          "Unknown"
        )
      )
    )
  )
)