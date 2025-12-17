module chainrefer::chainrefer {
    use std::signer;
    use std::vector;
    use aptos_framework::event;
    use aptos_std::table::{Self, Table};

    /// Error codes
    const E_NOT_VERIFIER: u64 = 1;
    const E_NOT_STUDENT: u64 = 2;
    const E_NOT_ALUMNI: u64 = 3;
    const E_ALREADY_REGISTERED: u64 = 4;
    const E_NOT_REGISTERED: u64 = 5;
    const E_JOB_NOT_FOUND: u64 = 6;
    const E_ALREADY_APPLIED: u64 = 7;
    const E_NOT_VERIFIED: u64 = 8;

    /// Student data
    struct Student has store, drop, copy {
        resume_hash: vector<u8>,
        is_verified: bool,
        verified_by: address,
    }

    /// Job data
    struct Job has store, drop, copy {
        job_id: vector<u8>,
        created_by: address,
        applicants: vector<address>,
    }

    /// Main storage resource
    struct ChainReferStorage has key {
        verifier: address,
        students: Table<address, Student>,
        jobs: Table<vector<u8>, Job>,
        job_ids: vector<vector<u8>>,
        alumni: vector<address>,
    }

    /// Events
    #[event]
    struct ResumeSubmitted has drop, store {
        student: address,
        resume_hash: vector<u8>,
    }

    #[event]
    struct ResumeVerified has drop, store {
        student: address,
        verifier: address,
        is_approved: bool,
    }

    #[event]
    struct JobCreated has drop, store {
        job_id: vector<u8>,
        alumni: address,
    }

    #[event]
    struct JobApplication has drop, store {
        job_id: vector<u8>,
        student: address,
    }

    /// Initialize the contract - call once by deployer
    public entry fun initialize(account: &signer, verifier_address: address) {
        let storage = ChainReferStorage {
            verifier: verifier_address,
            students: table::new(),
            jobs: table::new(),
            job_ids: vector::empty(),
            alumni: vector::empty(),
        };
        move_to(account, storage);
    }

    /// Register as alumni
    public entry fun register_alumni(account: &signer, contract_address: address) acquires ChainReferStorage {
        let alumni_addr = signer::address_of(account);
        let storage = borrow_global_mut<ChainReferStorage>(contract_address);
        
        // Check not already registered
        let i = 0;
        let len = vector::length(&storage.alumni);
        while (i < len) {
            assert!(*vector::borrow(&storage.alumni, i) != alumni_addr, E_ALREADY_REGISTERED);
            i = i + 1;
        };
        
        vector::push_back(&mut storage.alumni, alumni_addr);
    }

    /// Student submits resume hash
    public entry fun submit_resume(
        account: &signer,
        contract_address: address,
        resume_hash: vector<u8>
    ) acquires ChainReferStorage {
        let student_addr = signer::address_of(account);
        let storage = borrow_global_mut<ChainReferStorage>(contract_address);
        
        let student = Student {
            resume_hash,
            is_verified: false,
            verified_by: @0x0,
        };
        
        if (table::contains(&storage.students, student_addr)) {
            table::remove(&mut storage.students, student_addr);
        };
        table::add(&mut storage.students, student_addr, student);
        
        event::emit(ResumeSubmitted {
            student: student_addr,
            resume_hash,
        });
    }

    /// Verifier approves or rejects resume
    public entry fun verify_resume(
        account: &signer,
        contract_address: address,
        student_address: address,
        is_approved: bool
    ) acquires ChainReferStorage {
        let verifier_addr = signer::address_of(account);
        let storage = borrow_global_mut<ChainReferStorage>(contract_address);
        
        // Only verifier can verify
        assert!(verifier_addr == storage.verifier, E_NOT_VERIFIER);
        
        // Student must exist
        assert!(table::contains(&storage.students, student_address), E_NOT_REGISTERED);
        
        let student = table::borrow_mut(&mut storage.students, student_address);
        student.is_verified = is_approved;
        student.verified_by = verifier_addr;
        
        event::emit(ResumeVerified {
            student: student_address,
            verifier: verifier_addr,
            is_approved,
        });
    }

    /// Alumni creates a job
    public entry fun create_job(
        account: &signer,
        contract_address: address,
        job_id: vector<u8>
    ) acquires ChainReferStorage {
        let alumni_addr = signer::address_of(account);
        let storage = borrow_global_mut<ChainReferStorage>(contract_address);
        
        // Check if alumni is registered
        let is_alumni = false;
        let i = 0;
        let len = vector::length(&storage.alumni);
        while (i < len) {
            if (*vector::borrow(&storage.alumni, i) == alumni_addr) {
                is_alumni = true;
                break
            };
            i = i + 1;
        };
        assert!(is_alumni, E_NOT_ALUMNI);
        
        let job = Job {
            job_id,
            created_by: alumni_addr,
            applicants: vector::empty(),
        };
        
        table::add(&mut storage.jobs, job_id, job);
        vector::push_back(&mut storage.job_ids, job_id);
        
        event::emit(JobCreated {
            job_id,
            alumni: alumni_addr,
        });
    }

    /// Student applies to job
    public entry fun apply_to_job(
        account: &signer,
        contract_address: address,
        job_id: vector<u8>
    ) acquires ChainReferStorage {
        let student_addr = signer::address_of(account);
        let storage = borrow_global_mut<ChainReferStorage>(contract_address);
        
        // Student must be registered and verified
        assert!(table::contains(&storage.students, student_addr), E_NOT_REGISTERED);
        let student = table::borrow(&storage.students, student_addr);
        assert!(student.is_verified, E_NOT_VERIFIED);
        
        // Job must exist
        assert!(table::contains(&storage.jobs, job_id), E_JOB_NOT_FOUND);
        
        let job = table::borrow_mut(&mut storage.jobs, job_id);
        
        // Check not already applied
        let i = 0;
        let len = vector::length(&job.applicants);
        while (i < len) {
            assert!(*vector::borrow(&job.applicants, i) != student_addr, E_ALREADY_APPLIED);
            i = i + 1;
        };
        
        vector::push_back(&mut job.applicants, student_addr);
        
        event::emit(JobApplication {
            job_id,
            student: student_addr,
        });
    }

    /// View functions

    #[view]
    public fun get_student(contract_address: address, student_address: address): (vector<u8>, bool, address) acquires ChainReferStorage {
        let storage = borrow_global<ChainReferStorage>(contract_address);
        assert!(table::contains(&storage.students, student_address), E_NOT_REGISTERED);
        let student = table::borrow(&storage.students, student_address);
        (student.resume_hash, student.is_verified, student.verified_by)
    }

    #[view]
    public fun is_student_verified(contract_address: address, student_address: address): bool acquires ChainReferStorage {
        let storage = borrow_global<ChainReferStorage>(contract_address);
        if (!table::contains(&storage.students, student_address)) {
            return false
        };
        let student = table::borrow(&storage.students, student_address);
        student.is_verified
    }

    #[view]
    public fun get_job_applicants(contract_address: address, job_id: vector<u8>): vector<address> acquires ChainReferStorage {
        let storage = borrow_global<ChainReferStorage>(contract_address);
        assert!(table::contains(&storage.jobs, job_id), E_JOB_NOT_FOUND);
        let job = table::borrow(&storage.jobs, job_id);
        job.applicants
    }

    #[view]
    public fun get_verifier(contract_address: address): address acquires ChainReferStorage {
        let storage = borrow_global<ChainReferStorage>(contract_address);
        storage.verifier
    }

    #[view]
    public fun is_alumni(contract_address: address, addr: address): bool acquires ChainReferStorage {
        let storage = borrow_global<ChainReferStorage>(contract_address);
        let i = 0;
        let len = vector::length(&storage.alumni);
        while (i < len) {
            if (*vector::borrow(&storage.alumni, i) == addr) {
                return true
            };
            i = i + 1;
        };
        false
    }
}
