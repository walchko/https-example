# Simple HTTPS Server

Here is a compilation of info I found on the internet about doing HTTPS with Node.js
27 Dec 2015.


[Simple HTTPS Test Server Using Node.js](http://www.alexkras.com/simple-https-test-server-using-node-js/)

## Issues

* Chrome pitches a fit when it sees a self signed cert. Need to fix this.
* Support HTTP/2 (https2 package in node.js) however, a lot os http2 benefits do not 
appear to be working at this time.
* [Let's Encrypt](https://letsencrypt.org/) looks awesome, but only works on public available
websites which mystuff doesn't run on.

## Certificates

Certificates on a private network are a pain. You can't use a CA on private networks, so 
you are forced to use self-signed certs, but browsers inherently don't trust them. Thus,
you need to enable trust on each system trying to use them. For 
[OSX](https://support.apple.com/kb/PH18677?locale=en_US):

If a certificate is not accepted, it may have expired or it may be invalid for the way 
it’s being used. For example, some certificates may be used for establishing a secure 
connection to a server but not for signing a document.

The most common reason a certificate isn’t accepted is that the certificate authority’s 
root certificate isn’t trusted by your computer. To have your computer trust a certificate 
authority, you must add the certificate authority to a keychain and set the certificate 
trust settings.

If an app (such as Safari) displays the root certificate from the certificate authority as 
part of the message from the certificate authority. Drag the root certificate icon to the 
desktop.

1. Drag the certificate file onto the Keychain Access icon, or double-click the certificate 
file
1. Click the keychain pop-up menu, choose a keychain (login), then click OK
1. If you’re asked, enter the name and password for an administrator user on this computer
1. Select the certificate, then choose File > Get Info
1. Click the Trust disclosure triangle to display the trust policies for the certificate
1. Click the "Always Trust" under "When using this certificate" and there will now be a
blue plus in the lower left corner of the cert instead of a red x

For more information, see Certificate trust policies.

You are still stuck having to update these certs periodically which is a pain

## Setup

I needed a simple server to test my HTTPS POST requests. Just like a regular HTTP server, 
it is super easy to do in Node. Except I needed to add private key and a cert, which is 
an extra step and was not immediately obvious to me, so I figure I’d share my findings.

[source](http://techglimpse.com/sha256-hash-certificate-openssl/)

Step 1. Generate self signed Key and Cert using [`openssl`](https://www.openssl.org/docs/manmaster/apps/openssl.html)

    openssl req -x509 -nodes -sha256 -days 365 -newkey rsa:2048 -keyout server.key -out server.crt

* **req** PKCS#10 X.509 Certificate Signing Request (CSR) Management.
* **nodes** don't encrypt the output key
* **days** number of days a certificate generated by -x509 is valid for
* **newkey** rsa:bits generate a new RSA key of 'bits' in size
* **keyout** file to send the key to
* **out** output file
* **sha256** digest with SHA-2 encryption

You will have to enter the following (or similar) when creating a cert:

    [kevin@Tardis https]$ openssl req -x509 -nodes -sha256 -days 365 -newkey rsa:2048 -keyout server.key -out server.crt
    Generating a 2048 bit RSA private key
    .................................+++
    ...........................................................+++
    writing new private key to 'server.key'
    -----
    You are about to be asked to enter information that will be incorporated
    into your certificate request.
    What you are about to enter is what is called a Distinguished Name or a DN.
    There are quite a few fields but you can leave some blank
    For some fields there will be a default value,
    If you enter '.', the field will be left blank.
    -----
    Country Name (2 letter code) [AU]:US
    State or Province Name (full name) [Some-State]:FL
    Locality Name (eg, city) []:Gainesville
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:ACME
    Organizational Unit Name (eg, section) []:
    Common Name (e.g. server FQDN or YOUR name) []:tardis.local.
    Email Address []:kevin@gmail.com

Make sure the FQDN is correct for your server, otherwise, you will get errors about the 
cert not matching the url. Thus, `https://localhost:8181` will match `localhost.` but not
`https://tardis.local:8181`. Therefore, I had to do FQDN: `tardis.local.` (also note the 
period at the end of the FQDN).

Also, due to the depreciation ([easy compromising](https://www.symantec.com/page.jsp?id=sha2-transition)) 
of SHA-1 certs, need to produce SHA-2 (SHA256) (Secure Hash Algorithm) certs because 
browsers will stop recognizing the old ones soon. To double check:

    [kevin@Tardis certs]$ openssl x509 -noout -text -in server.crt
    Certificate:
		Data:
			Version: 3 (0x2)
			Serial Number:
				9a:a2:04:d8:c0:c8:82:37
			Signature Algorithm: sha256WithRSAEncryption
			Issuer: C=US, ST=CO, L=COS, O=ACME, CN=kevin/emailAddress=kevin@here.com
			Validity
				Not Before: Dec 27 20:49:29 2015 GMT
				Not After : Dec 26 20:49:29 2016 GMT
			Subject: C=US, ST=CO, L=COS, O=ACME, CN=kevin/emailAddress=kevin@here.com
			Subject Public Key Info:
				Public Key Algorithm: rsaEncryption
				RSA Public Key: (2048 bit)
					Modulus (2048 bit):
						00:9c:99:1e:e5:a2:df:01:68:7f:6d:bc:f5:bf:8f:
						d9:a5:a1:9c:34:51:a8:fe:a5:18:3d:af:76:0b:c1:
						22:27:b3:21:fd:52:90:c5:4c:b7:0d:4c:e0:c9:d0:
						25:bd:d2:8d:81:e0:30:3a:2c:52:2c:be:ec:b6:2b:
						c7:d4:fc:06:8f:e5:84:6b:75:3e:ad:f4:cf:42:4e:
						f4:22:77:89:e4:f0:33:95:e0:d0:06:b0:ff:1d:cd:
						ef:a9:65:e4:75:ff:ea:8e:aa:2d:f2:02:d9:e1:48:
						7e:2e:16:1d:d2:65:2e:25:2c:43:c5:60:e6:94:4a:
						a6:25:ad:d5:98:ca:a1:02:79:4e:7b:ea:6b:0b:fd:
						40:59:47:45:6d:91:bc:70:b0:2f:99:c2:ad:80:8c:
						42:77:38:fd:ce:74:8f:81:7e:0e:95:f1:52:44:fb:
						b5:ff:41:1a:a4:1b:f0:79:2b:49:95:c7:ea:80:8c:
						01:ce:d6:95:d1:77:cf:76:21:38:0d:95:06:6e:8b:
						45:45:e1:bc:8b:0e:af:f0:ee:44:d4:38:f0:e3:83:
						59:55:8f:d6:a2:69:ea:85:9d:f7:9d:26:4d:23:7d:
						47:78:47:c3:ae:3d:ae:32:e3:a8:d8:2b:bb:88:c2:
						51:6f:c1:f1:e8:0f:76:6a:cc:8a:60:18:68:32:32:
						4b:f9
					Exponent: 65537 (0x10001)
			X509v3 extensions:
				X509v3 Subject Key Identifier: 
					B6:05:4E:38:5D:41:5D:4A:DF:37:75:9F:23:A3:AB:73:96:A9:1F:A8
				X509v3 Authority Key Identifier: 
					keyid:B6:05:4E:38:5D:41:5D:4A:DF:37:75:9F:23:A3:AB:73:96:A9:1F:A8
					DirName:/C=US/ST=CO/L=COS/O=ACME/CN=kevin/emailAddress=kevin@here.com
					serial:9A:A2:04:D8:C0:C8:82:37

				X509v3 Basic Constraints: 
					CA:TRUE
		Signature Algorithm: sha256WithRSAEncryption
			0a:1c:59:ab:c4:57:36:ef:ba:bf:47:38:75:37:62:f9:8a:97:
			c3:2c:b7:40:e7:be:f3:7d:43:1d:0b:22:e5:34:bb:ea:f3:ab:
			94:11:fa:4e:c8:1d:9c:98:1b:44:e7:72:0f:34:b9:c2:2b:63:
			11:18:50:10:b1:38:8e:14:cd:d9:26:41:6e:84:68:49:29:43:
			89:23:6a:98:5e:f4:f2:61:17:3c:ad:7c:72:23:2b:ca:24:60:
			cf:dd:94:71:fd:68:45:4f:7b:20:3b:d9:b5:35:22:a1:b7:a7:
			52:2f:b9:6b:f1:f3:e9:aa:53:c2:42:b3:3d:d9:0a:bb:97:0d:
			9d:8a:b6:dd:95:7c:8f:bd:bf:ca:5b:c0:74:20:dc:ee:9a:81:
			87:16:0a:c8:56:10:9b:6a:e1:59:76:ea:dd:a7:e2:03:41:fa:
			bc:70:34:0f:07:13:fa:9a:29:2b:db:06:1f:82:a4:1b:21:97:
			57:49:a8:4f:08:ea:e1:e2:fb:19:16:bc:73:81:af:c2:09:67:
			2e:c0:0c:1e:cb:1d:48:eb:65:c0:4d:52:19:3e:94:67:1d:25:
			4e:e2:df:f5:ff:a3:9b:88:33:56:3d:85:f4:b9:12:e6:4c:38:
			26:9c:60:3a:ae:8a:e9:a3:de:d1:44:9e:79:a2:65:17:fb:79:
			c8:8a:c3:e8


Step 2. Create server file

Copy the code bellow into a server.js file (or whatever you want to call it, and run it with 
    $ node server.js

server.js:

    "use strict";

    var https = require('https');
    var fs = require('fs');
    var qs = require('querystring');

    var options = {
      key: fs.readFileSync('server.key'),
      cert: fs.readFileSync('server.crt')
    };

    var PORT = 8181;

    function handleRequest(req, res){
      //Process Post Request
      if(req.method === "POST"){

        var data = '';

        req.on('data', function(chunk){
          data += chunk;
        });

        req.on('end', function(){
          var parseData = qs.parse(data);
          var prettyData = JSON.stringify(parseData, null, 2);
          console.log("Post request with:\n" + prettyData);
          res.end(prettyData);
        });
      } else { //Send a simple response
        res.end('Everything works');
      }
    }

    //Create a server
    var server = https.createServer(options, handleRequest);

    //Start server
    server.listen(PORT, function(){
      console.log("Server listening on: https://localhost:" + PORT);
    });


