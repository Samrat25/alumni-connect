# ChainRefer Smart Contract

A simple Aptos Move smart contract for the ChainRefer Alumni Referral Protocol.

## Features

### Roles
- **Student**: Can submit resume hash, apply to jobs (after verification)
- **Verifier**: Can approve/reject student resumes
- **Alumni**: Can register, create jobs, view applicants

### Functions

#### Entry Functions (require transaction signing)

1. **initialize(verifier_address)** - Initialize contract with verifier address (call once)
2. **register_alumni()** - Register as an alumni
3. **submit_resume(resume_hash)** - Student submits resume hash
4. **verify_resume(student_address, is_approved)** - Verifier approves/rejects resume
5. **create_job(job_id)** - Alumni creates a job posting
6. **apply_to_job(job_id)** - Verified student applies to job

#### View Functions (read-only, no gas)

1. **get_student(student_address)** - Get student data
2. **is_student_verified(student_address)** - Check if student is verified
3. **get_job_applicants(job_id)** - Get list of applicants for a job
4. **get_verifier()** - Get verifier address
5. **is_alumni(address)** - Check if address is registered alumni

## Deployment to Devnet

### Prerequisites
```bash
# Install Aptos CLI
curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
```

### Deploy Steps

1. **Create a new account**
```bash
cd contracts
aptos init --network devnet
```

2. **Fund the account**
```bash
aptos account fund-with-faucet --account default
```

3. **Compile the contract**
```bash
aptos move compile --named-addresses chainrefer=default
```

4. **Deploy to Devnet**
```bash
aptos move publish --named-addresses chainrefer=default
```

5. **Initialize the contract**
```bash
aptos move run \
  --function-id 'default::chainrefer::initialize' \
  --args 'address:<VERIFIER_ADDRESS>'
```

## Usage Example

### Submit Resume (Student)
```bash
aptos move run \
  --function-id '<CONTRACT_ADDRESS>::chainrefer::submit_resume' \
  --args 'address:<CONTRACT_ADDRESS>' 'hex:<RESUME_HASH>'
```

### Verify Resume (Verifier)
```bash
aptos move run \
  --function-id '<CONTRACT_ADDRESS>::chainrefer::verify_resume' \
  --args 'address:<CONTRACT_ADDRESS>' 'address:<STUDENT_ADDRESS>' 'bool:true'
```

### Create Job (Alumni)
```bash
# First register as alumni
aptos move run \
  --function-id '<CONTRACT_ADDRESS>::chainrefer::register_alumni' \
  --args 'address:<CONTRACT_ADDRESS>'

# Then create job
aptos move run \
  --function-id '<CONTRACT_ADDRESS>::chainrefer::create_job' \
  --args 'address:<CONTRACT_ADDRESS>' 'hex:<JOB_ID>'
```

### Apply to Job (Verified Student)
```bash
aptos move run \
  --function-id '<CONTRACT_ADDRESS>::chainrefer::apply_to_job' \
  --args 'address:<CONTRACT_ADDRESS>' 'hex:<JOB_ID>'
```

## Error Codes

| Code | Description |
|------|-------------|
| 1 | Not authorized as verifier |
| 2 | Not registered as student |
| 3 | Not registered as alumni |
| 4 | Already registered |
| 5 | Not registered |
| 6 | Job not found |
| 7 | Already applied to job |
| 8 | Resume not verified |

## Notes

- This is a prototype for Devnet only
- No production security measures
- Stores only hashes, addresses, and booleans
- No payments, tokens, or NFTs
