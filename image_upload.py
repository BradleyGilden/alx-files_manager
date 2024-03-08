import base64
import requests
import sys

# X-Token: 3ffd3e19-792d-406f-848a-777785ba55fe
# folder Id : 65eb112660f9c94f5cb15e67 - becomes parent id
# user id : 65ea0ac6a63fa5528d0f779a

file_path = sys.argv[1]
file_name = file_path.split('/')[-1]

file_encoded = None
with open(file_path, "rb") as image_file:
    file_encoded = base64.b64encode(image_file.read()).decode('utf-8')

r_json = { 'name': file_name, 'type': 'image', 'isPublic': True, 'data': file_encoded, 'parentId': sys.argv[3] }
r_headers = { 'X-Token': sys.argv[2] }

r = requests.post("http://0.0.0.0:5000/files", json=r_json, headers=r_headers)
print(r.json())
