// Mock environment variables
process.env.S3_BUCKET = "mock-bucket";
process.env.REGION = "us-east-1";
process.env.API_TOKEN = "mock-token-123";

const axios = require("axios");
const { createObjectCsvWriter } = require("csv-writer");

const {
  fetchBikeData,
  transformBikeData,
  writeDataToCsv,
} = require("../src/lamdaLogic");

jest.setTimeout(30000);
jest.mock("axios");
jest.mock("fs");
jest.mock("path");
jest.mock("csv-writer", () => {
  const writeRecordsMock = jest.fn().mockResolvedValue(); // Mock writeRecords
  return {
    createObjectCsvWriter: jest.fn(() => ({
      writeRecords: writeRecordsMock,
    })),
    __mocks__: {
      writeRecordsMock,
    },
  };
});

jest.mock("@aws-sdk/client-s3", () => {
  const mockSend = jest.fn();
  return {
    S3Client: jest.fn(() => ({
      send: mockSend,
    })),
    PutObjectCommand: jest.fn(),
    __mocks__: {
      mockSend,
    },
  };
});

describe("Bike Data Functions", () => {
  describe("fetchBikeData", () => {
    it("should fetch bike data from API", async () => {
      const mockData = { data: { stations: [] } };
      axios.get.mockResolvedValue({ data: mockData });

      const result = await fetchBikeData(
        "https://gbfs.divvybikes.com/gbfs/en/station_information.json"
      );
      expect(result).toEqual(mockData);
      expect(axios.get).toHaveBeenCalledWith(
        "https://gbfs.divvybikes.com/gbfs/en/station_information.json"
      );
    });
  });

  describe("transformBikeData", () => {
    it("should transform bike data correctly", () => {
      const stations = [
        {
          external_id: "ext123",
          station_id: "stn123",
          legacy_id: "lg123",
          capacity: 10,
          rental_methods: ["CARD"],
          rental_uris: {},
          name: "Station 1",
        },
        {
          external_id: "ext456",
          station_id: "stn456",
          legacy_id: "lg456",
          capacity: 15,
          rental_methods: ["CARD"],
          rental_uris: {},
          name: "Station 2",
        },
      ];

      const result = transformBikeData(stations);
      expect(result).toEqual([
        {
          externalId: "ext123",
          stationId: "stn123",
          legacyId: "lg123",
          capacity: 10,
          name: "Station 1",
        },
      ]);
    });
  });

  describe("writeDataToCsv", () => {
    it("should write data to a CSV file", async () => {
      const mockData = [
        {
          externalId: "ext123",
          stationId: "stn123",
          legacyId: "lg123",
          capacity: 10,
          name: "Station 1",
        },
      ];
      const mockPath = "/mock/output.csv";

      await writeDataToCsv(mockData, mockPath);

      expect(createObjectCsvWriter).toHaveBeenCalledWith({
        path: mockPath,
        header: expect.any(Array),
      });

      expect(createObjectCsvWriter().writeRecords).toHaveBeenCalledWith(
        mockData
      );
    });
  });
});
