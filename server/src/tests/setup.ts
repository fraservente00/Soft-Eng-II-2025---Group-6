import { TestDataSource } from "./test-datasource";

beforeAll(async () => {
    console.log("✅ Starting Jest test suite...");
    await TestDataSource.initialize();
});

afterAll(async () => {
    console.log("🏁 Test suite finished!");
    await TestDataSource.destroy();
});
