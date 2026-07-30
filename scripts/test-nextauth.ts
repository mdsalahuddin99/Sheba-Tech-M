async function main() {
  const email = "onlinetaiba@gmail.com";
  const password = "Mizan@2027";

  console.log("Sending POST request to NextAuth...");
  
  // To avoid CSRF issues with the NextAuth API, we first need to fetch a CSRF token.
  const csrfRes = await fetch("http://localhost:3001/api/auth/csrf");
  const csrfData = await csrfRes.json();
  const csrfToken = csrfData.csrfToken;
  const cookie = csrfRes.headers.get('set-cookie');

  console.log("Got CSRF Token:", csrfToken);

  const res = await fetch("http://localhost:3001/api/auth/callback/credentials", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cookie": cookie || ""
    },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      json: "true"
    })
  });

  const text = await res.text();
  console.log("Response Status:", res.status);
  console.log("Response URL:", res.url);
  console.log("Response Body:", text);
}

main().catch(console.error);
