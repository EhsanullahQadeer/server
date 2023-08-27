import { BetaAnalyticsDataClient } from "@google-analytics/data";

// Google analytics api
let propertyId = "404070265";
const analyticsDataClient = new BetaAnalyticsDataClient();

export async function googlAnalyticsReport() {
  const [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,

    dateRanges: [
      {
        startDate: "2023-08-01",
        endDate: "today",
      },
    ],
    metrics: [
      {
        name: "totalUsers",
      },
    ],
  });
  let metricObj = response.rows[0].metricValues[0];
  return { totalVisitors: metricObj.value };
  //   response.rows.forEach((row) => {
  //     // console.log(row.metricValues[0]);
  //     return row.metricValues[0];
  //   });
}
