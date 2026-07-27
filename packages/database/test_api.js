async function test() {
  try {
    console.log("Fetching /api/customers...");
    const res1 = await fetch('http://127.0.0.1:8080/api/customers');
    console.log("Customers Status:", res1.status);
    console.log("Customers Body:", await res1.text());

    console.log("\nFetching /api/dashboard...");
    const res2 = await fetch('http://127.0.0.1:8080/api/dashboard');
    console.log("Dashboard Status:", res2.status);
    console.log("Dashboard Body:", await res2.text());
  } catch (err) {
    console.error("FETCH ERROR:", err);
  }
}
test();
