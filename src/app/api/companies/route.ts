import { NextRequest, NextResponse } from 'next/server';

// List of popular tech companies for LeetCode problems
const COMPANIES = [
  'Google', 'Amazon', 'Microsoft', 'Apple', 'Facebook', 'Netflix', 'Tesla',
  'Adobe', 'Airbnb', 'Uber', 'Lyft', 'Twitter', 'LinkedIn', 'Salesforce',
  'Oracle', 'IBM', 'Intel', 'NVIDIA', 'PayPal', 'eBay', 'Yahoo', 'Dropbox',
  'Spotify', 'Snapchat', 'Pinterest', 'Reddit', 'Slack', 'Zoom', 'TikTok',
  'ByteDance', 'Alibaba', 'Tencent', 'Baidu', 'JD.com', 'Meituan', 'Didi',
  'Goldman Sachs', 'JPMorgan', 'Morgan Stanley', 'Citadel', 'Two Sigma',
  'Jane Street', 'DE Shaw', 'Palantir', 'Databricks', 'Snowflake', 'Stripe',
  'Square', 'Coinbase', 'Robinhood', 'DoorDash', 'Instacart', 'Twilio',
  'Atlassian', 'ServiceNow', 'Workday', 'Okta', 'Splunk', 'VMware',
  'Cisco', 'Juniper Networks', 'F5 Networks', 'Palo Alto Networks',
  'CrowdStrike', 'Zscaler', 'Fortinet', 'Check Point', 'FireEye',
  'Symantec', 'McAfee', 'Trend Micro', 'Kaspersky', 'Avast', 'Norton',
  'Bitdefender', 'ESET', 'Sophos', 'Malwarebytes', 'Avira', 'AVG',
  'Comodo', 'Webroot', 'Carbon Black', 'SentinelOne', 'Cylance',
  'Darktrace', 'Vectra', 'Rapid7', 'Qualys', 'Tenable', 'Nessus',
  'OpenVAS', 'Nmap', 'Wireshark', 'Metasploit', 'Burp Suite', 'OWASP ZAP',
  'Acunetix', 'Veracode', 'Checkmarx', 'SonarQube', 'Fortify', 'AppScan',
  'WhiteHat Security', 'HackerOne', 'Bugcrowd', 'Synack', 'Cobalt',
  'YesWeHack', 'Intigriti', 'Zerocopter', 'BugBounty', 'HackerEarth'
].sort();

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: COMPANIES
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}
