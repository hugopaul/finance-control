import requests

url = 'https://solidtechsolutions.com.br/api/debts/ae7f06e0-cc28-497c-b952-97283b377b6c'
headers = {
    'Accept': '*/*',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxNThmZWE2NS1jZTg3LTQ0YjgtOTc3ZC1kNjRiODIxYjg5MGMiLCJleHAiOjE3NTMwMzkxMTEsInR5cGUiOiJhY2Nlc3MifQ.4tLzwmdnEqmcXMXHLWbHsESO4PQ_GclSK8BBPFxWMSs',
    'Content-Type': 'application/json'
}
data = {
    'person_id': 'e4a29ab9-2b60-4afd-b67f-bc63e0dd4aaa',
    'description': 'string',
    'amount': 110,
    'date': '2025-07-20',
    'due_date': '2025-07-20',
    'status': 'paid',
    'paid_amount': 0,
    'payment_method_id': 'c4ea30c5-4518-47fa-b954-8fe9c2cc91ee'
}

resp = requests.put(url, headers=headers, json=data) 