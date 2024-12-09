# Bike Data Processor

## Overview

The **Bike Data Processor** application fetches bike station data from an API, transforms it based on specific rules, writes the transformed data to a CSV file, and uploads the file to an S3 bucket. The application is designed to run both locally and as an AWS Lambda function.

## Features

- Fetches bike station data from the Divvy Bikes API.
- Filters stations with a capacity of less than 12.
- Transforms the data:
  - Removes `rental_methods` and `rental_uris`.
  - Renames `external_id`, `station_id`, and `legacy_id` to `externalId`, `stationId`, and `legacyId`.
- Writes the transformed data to a CSV file.
- Uploads the CSV file to an S3 bucket.

### Demo link

You can use the following API Gateway URL to trigger the demo:
https://i9uq8babz8.execute-api.us-east-2.amazonaws.com/prod/process-data

After successfully invoking the endpoint, you can view the transformed data at:
https://nodejs-pg-e-data.s3.amazonaws.com/output.csv.

## Setup and Usage

### Prerequisites

- Node.js (v18+ or later)
- AWS CLI configured with proper IAM permissions
- An S3 bucket

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/syedikramali/pge-mrad-nodejs-challenge.git
   cd pge-mrad-nodejs-challenge
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the project root:
     ```plaintext
     S3_BUCKET=your-s3-bucket-name
     REGION=your-us-east-1
     API_TOKEN=b478654f864f326ff674b806c4b4f4b0
     AWS_ACCESS_KEY_ID=your-aws-access-key-id
     AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
     IS_LAMBDA=true # set to false if running locally
     ```

### Create an S3 Bucket

To store the output CSV file, you need an S3 bucket. Follow these steps to create one:

1. **Using AWS Management Console**:
   - Log in to the [AWS Management Console](https://aws.amazon.com/console/).
   - Navigate to the **S3** service.
   - Click **Create bucket**.
   - Enter a unique **Bucket name** (e.g., `bike-data-processor-output`).
   - Choose the **AWS Region** where you want the bucket.
   - Adjust permissions (e.g., enable or disable public access) based on your use case.
   - Click **Create bucket**.

### Running Locally

1. Run the application:

   ```bash
   npm start
   ```

   ```bash
   curl "http://localhost:3000/process-data?token=your-api-token"
   ```

2. Check the output:
   - The transformed CSV file will be saved in the project directory as `output.csv`.
   - The file will also be uploaded to the specified S3 bucket.

#### With Docker

1. Build the Docker image:

   ```bash
   docker build -t bike-data-processor .
   ```

2. Run the Docker container:
   ```bash
   docker run --env-file .env bike-data-processor
   ```
   make sure to add the .env and update env variables

### Deploying to AWS Lambda

1. **Prepare the Deployment Package**:

   - Install production dependencies:
     ```bash
     npm install --production
     ```
   - Create a ZIP file for deployment:
     ```bash
     zip -r lambda-deployment.zip node_modules src index.js package.json
     ```

2. **Deploy to AWS Lambda**:

   - Create or update a Lambda function in the AWS Management Console.
   - Upload the `lambda-deployment.zip` file.

3. **Add Environment Variables to Lambda**:

   - Navigate to the **Configuration** tab of your Lambda function.
   - Select **Environment variables** and click **Edit**.
   - Add the following variables:
     - `S3_BUCKET`: Your S3 bucket name.
     - `REGION`: The AWS region where your bucket is located.
     - `IS_LAMBDA`: Set to `true` on AWS Lambda environment.
     - `API_TOKEN`: `b478654f864f326ff674b806c4b4f4b0`. just for extra security you can add your own token or just use the default one.
   - Save the changes.

4. **Test the Lambda Function**:
   - Use the AWS Lambda Test feature or API Gateway to trigger the function.

## Project Structure

```
pge-mrad-nodejs-challenge/
├── src/
│   ├── lambdaLogic.js         # Core application logic
│   ├── config.js              # Environment variable configuration
├── node_modules/              # Project dependencies
├── package.json               # Dependencies and scripts
├── package-lock.json          # Dependency lock file
├── index.js                   # Lambda handler entry point
├── server.js                  # Local server entry point
└── README.md                  # Project documentation
```

## Testing

1. Install development dependencies:

   ```bash
   npm install --save-dev jest
   ```

2. Run the tests:

   ```bash
   npm test
   ```

3. Test Coverage:
   - Unit tests are included for each function:
     - Fetching bike data
     - Transforming bike data
     - Writing data to a CSV file

## IAM Policy for AWS Lambda

Ensure the Lambda function has the following permissions or just give `AmazonS3FullAccess` :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::your-s3-bucket-name/*"
    }
  ]
}
```

## Known Limitations

- AWS Lambda has a writable `/tmp` directory limited to 512MB.
- Ensure proper IAM permissions for the Lambda execution role.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
