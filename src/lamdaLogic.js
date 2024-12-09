const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { createObjectCsvWriter } = require("csv-writer");
const {
  S3_BUCKET,
  REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  IS_LAMBDA,
} = require("./config");

let s3Client;

if (IS_LAMBDA) {
  // used during lamda execution
  s3Client = new S3Client({ region: REGION });
} else {
  // used locally
  s3Client = new S3Client({
    region: REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });
}

async function fetchBikeData(url) {
  const response = await axios.get(url);
  return response.data;
}

function transformBikeData(stations) {
  return stations
    .map((station) => {
      const {
        rental_methods,
        rental_uris,
        external_id,
        station_id,
        legacy_id,
        ...rest
      } = station;
      return {
        ...rest,
        externalId: external_id,
        stationId: station_id,
        legacyId: legacy_id,
      };
    })
    .filter((station) => station.capacity < 12);
}

async function writeDataToCsv(data, filePath) {
  const writer = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: "externalId", title: "ExternalId" },
      { id: "stationId", title: "StationId" },
      { id: "legacyId", title: "LegacyId" },
      { id: "capacity", title: "Capacity" },
      { id: "name", title: "Name" },
      { id: "lat", title: "Lat" },
      { id: "lon", title: "Lon" },
      { id: "region_id", title: "RegionId" },
      { id: "eightd_station_services", title: "EightdStationServices" },
    ],
  });

  await writer.writeRecords(data);
}

async function uploadToS3(filePath, bucketName, fileName) {
  const fileContent = fs.readFileSync(filePath);
  const uploadParams = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileContent,
  };

  await s3Client.send(new PutObjectCommand(uploadParams));
}

async function processBikeData(isLambda = false) {
  const url = "https://gbfs.divvybikes.com/gbfs/en/station_information.json";

  let filePath = isLambda
    ? path.join("/tmp", "output.csv")
    : path.join(__dirname, "..", "output.csv");

  try {
    const data = await fetchBikeData(url);
    console.log("Data fetched successfully.");

    // Transform data
    const transformedData = transformBikeData(data.data.stations);
    console.log("Data transformed successfully.");

    // Write data to CSV
    await writeDataToCsv(transformedData, filePath);
    console.log("Data written to CSV successfully.");

    // Upload CSV to S3
    await uploadToS3(filePath, S3_BUCKET, "output.csv");
    console.log("CSV uploaded to S3 successfully.");

    return `File successfully uploaded to S3, processed ${transformedData.length} stations.`;
  } catch (error) {
    console.error("Error:", error.message);
    return "Failed to process bike data.";
  }
}

module.exports = {
  processBikeData,
  fetchBikeData,
  transformBikeData,
  writeDataToCsv,
  uploadToS3,
};
