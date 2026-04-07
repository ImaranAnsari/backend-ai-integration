require("dotenv").config();
const { connectDB } = require("./config/db");
const Document = require("./models/Document");

const seedDocs = [
  {
    title: "Refund Policy",
    content:
      "Customers are eligible for a refund within 7 days of purchase. Approved refunds are processed within 5-7 business days to the original payment method.",
    tags: ["refund", "billing", "policy"],
  },
  {
    title: "Shipping Policy",
    content:
      "Standard shipping takes 3-5 business days in metro areas and 5-8 business days in non-metro locations.",
    tags: ["shipping", "delivery", "policy"],
  },
  {
    title: "Account Deletion",
    content:
      "Users can request account deletion from the profile settings page. Data is permanently deleted within 30 days.",
    tags: ["account", "privacy", "settings"],
  },
  {
    title: "Subscription Cancellation",
    content:
      "Subscriptions can be cancelled anytime. Access remains active until the end of the current billing cycle.",
    tags: ["subscription", "billing", "cancellation"],
  },
  {
    title: "Support Availability",
    content:
      "Support is available Monday to Friday, 9 AM to 6 PM IST. Average first response time is under 4 hours.",
    tags: ["support", "sla", "helpdesk"],
  },
];

async function runSeed() {
  await connectDB();
  await Document.deleteMany({});
  await Document.insertMany(seedDocs);
  console.log("Documents seeded successfully.");
  process.exit(0);
}

runSeed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
