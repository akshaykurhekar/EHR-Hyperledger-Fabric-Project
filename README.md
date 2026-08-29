# Electronic Health Record Blockchain Based Platfrom - Project

## Tech stack

    - Hyperledger Fabric blockchain (Node SDK JavaScript)
    - Node.js
    - Next.js
    - IPFS

<!-- ADD github access 

$ eval "$(ssh-agent -s)"
$ ssh-add ~/ssh/github -->

# Steps to setup project

## Download fabric binarys and fabric sample repo

    $ ./install-fabric.sh 

## To test network 

    $ cd fabric-samples/test-network
    $ ./network.sh up

    $ docker ps    // to check running container or check in docker desktop
    
    $ ./network.sh down     // to down network

## to run network with ca and create mychannel 

    $ cd fabric-samples/test-network
    
    Create network with ca cert: 
    
    $ ./network.sh up createChannel -ca -s couchdb
    
### Chain code deployment command

- Deploy chain code
	    
    $ ./network.sh deployCC -ccn ehrChainCode -ccp ../asset-transfer-basic/chaincode-javascript/ -ccl javascript

    *Down Network - only if you want to stop network or close system
	
    $ ./network.sh down

### Register Admin

    $ cd server-node-sdk/
    $ node cert-script/registerOrg1Admin.js
    $ node cert-script/registerOrg2Admin.js

### onboard script
    
    $ node cert-script/onboardHospital01.js 
    $ node cert-script/onboardDoctor.js

    $ node cert-script/onboardInsuranceCompany.js 
    $ node cert-script/onboardInsuranceAgent.js

    *** you can use script to call chaincode and perform read and write opration on blockchain ledger. - optional *** 

### start node server to use api

    $ npm run dev

### API List
    
    1. registerPatient - as Patient
    2. loginPatient - as Patient
    3. grantAccess - to doctor from Patient
    4. addRecord - of Patient
    5. getRecordById - of Patient 
    6. getAllRecordByPatienId - filter record by patient
    7. fetchLedger - fetch all transaction only admin can fetch.

## chaincode logic

    - lets first understand the actors in our chaincode

    1. Goverment - network owner
    2. Hospital - Network orgination 
    3. Practicing physician / Doctor - member of hospital
    4. Diagnostics center - org OR peer of hospital
    5. Pharmacies - Org OR peer of hospital
    6. Researchers / R&D - org
    7. Insurance companies - org
    8. Patient - end user


   ## now lets see there read write access

        1. Goverment - network owner - admin access
        2. Hospital - Network orgination - Read/Write (doctor data)
        3. Practicing physician/Doctor - Read/Write (Patient data w.r.t to hospital)
        4. Diagnostics center - Read/Write (Patient records w.r.t to diagnostics center)
        5. Pharmacies - Read/Write (Patient prescriptions w.r.t to pharma center)
        6. Researchers / R&D - Read data of hospital conect, pateint based on consent. 
        7. Insurance companies - Read/Write (Patient claims)
        8. Patient - Read/Write (All generated patient data)

  ## object strucutre in db.

  [ "recordType"="hospital", "createdBy"="hospitalId", data={ name="ABC Hosptial", address="acb location"  } ]

  [ "recordType"="physician", "createdBy"="physicianID", data={ name="ABC Hosptial", address="acb location"  } ]

## Steps to setup explorer

Step 0:  $ cd fabric-explorer/

Step 1. Copy the orgination folder from your running network to explorer to get access of one of the node in network.

    $  sudo cp -r ../fabric-samples/test-network/organizations/ .
    $  cp -r ../fabric-samples/test-network/organizations/ .

Step 2. Export env vraiables.
    
    export EXPLORER_CONFIG_FILE_PATH=./config.json
    export EXPLORER_PROFILE_DIR_PATH=./connection-profile
    export FABRIC_CRYPTO_PATH=./organizations

 
Step 3. Edit test-network.json 
	
    Inside adminPrivateKey section check the path
    It should look like this (change the id which is present in your crypto certs)

Step 4: 
    to start with out logs

    $ docker-compose up -d                    

    to start with logs.
    
    $ docker-compose up

Step 5: To Stop Explorer
        $ docker-compose down

```
EHR-Hyperledger-Fabric-Project
├─ backup
│  ├─ invokeByInvestor.js
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ registerAdmin.js
│  ├─ invoke.js
│  ├─ registerUser.js
│  ├─ helper.js
│  ├─ query.js
│  └─ app.js
├─ fabric-explorer
│  ├─ connection-profile
│  │  └─ test-network.json
│  ├─ config.json
│  └─ docker-compose.yaml
├─ EHR-APIs.postman_collection.json
├─ fabric-samples
│  ├─ CODEOWNERS
│  ├─ asset-transfer-ledger-queries
│  │  ├─ application-javascript
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ .eslintignore
│  │  │  └─ app.js
│  │  ├─ application-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  └─ main
│  │  │  │     ├─ resources
│  │  │  │     │  └─ log4j.properties
│  │  │  │     └─ java
│  │  │  │        └─ application
│  │  │  │           └─ java
│  │  │  │              ├─ EnrollAdmin.java
│  │  │  │              ├─ RegisterUser.java
│  │  │  │              └─ App.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  └─ gradlew.bat
│  │  ├─ chaincode-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ assetTransferLedger.ts
│  │  │  │  ├─ asset.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ tsconfig.json
│  │  │  └─ META-INF
│  │  │     └─ statedb
│  │  │        └─ couchdb
│  │  │           └─ indexes
│  │  │              └─ indexOwner.json
│  │  ├─ chaincode-javascript
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ index.js
│  │  │  ├─ lib
│  │  │  │  └─ asset_transfer_ledger_chaincode.js
│  │  │  ├─ .eslintignore
│  │  │  └─ META-INF
│  │  │     └─ statedb
│  │  │        └─ couchdb
│  │  │           └─ indexes
│  │  │              └─ indexOwner.json
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ asset_transfer_ledger_chaincode.go
│  │     ├─ go.mod
│  │     └─ META-INF
│  │        └─ statedb
│  │           └─ couchdb
│  │              └─ indexes
│  │                 └─ indexOwner.json
│  ├─ asset-transfer-sbe
│  │  ├─ README.md
│  │  ├─ application-javascript
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ .eslintignore
│  │  │  └─ app.js
│  │  ├─ chaincode-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ assetContract.ts
│  │  │  │  ├─ asset.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  └─ tsconfig.json
│  │  └─ chaincode-java
│  │     ├─ gradlew
│  │     ├─ settings.gradle
│  │     ├─ src
│  │     │  └─ main
│  │     │     └─ java
│  │     │        └─ org
│  │     │           └─ hyperledger
│  │     │              └─ fabric
│  │     │                 └─ samples
│  │     │                    └─ sbe
│  │     │                       ├─ AssetContract.java
│  │     │                       └─ Asset.java
│  │     ├─ gradle
│  │     │  └─ wrapper
│  │     │     ├─ gradle-wrapper.properties
│  │     │     └─ gradle-wrapper.jar
│  │     ├─ build.gradle
│  │     ├─ gradlew.bat
│  │     └─ config
│  │        └─ checkstyle
│  │           ├─ suppressions.xml
│  │           └─ checkstyle.xml
│  ├─ bin
│  │  ├─ cryptogen
│  │  ├─ osnadmin
│  │  ├─ fabric-ca-server
│  │  ├─ peer
│  │  ├─ discover
│  │  ├─ fabric-ca-client
│  │  ├─ orderer
│  │  ├─ ledgerutil
│  │  ├─ configtxlator
│  │  └─ configtxgen
│  ├─ MAINTAINERS.md
│  ├─ test-application
│  │  └─ javascript
│  │     ├─ CAUtil.js
│  │     └─ AppUtil.js
│  ├─ asset-transfer-abac
│  │  ├─ README.md
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ smart-contract
│  │     │  └─ abac.go
│  │     ├─ go.mod
│  │     └─ smartContract.go
│  ├─ test-network
│  │  ├─ addOrg3
│  │  │  ├─ ccp-template.yaml
│  │  │  ├─ README.md
│  │  │  ├─ org3-crypto.yaml
│  │  │  ├─ configtx.yaml
│  │  │  ├─ ccp-template.json
│  │  │  ├─ compose
│  │  │  │  ├─ compose-ca-org3.yaml
│  │  │  │  ├─ compose-org3.yaml
│  │  │  │  ├─ podman
│  │  │  │  │  ├─ podman-compose-ca-org3.yaml
│  │  │  │  │  ├─ podman-compose-org3.yaml
│  │  │  │  │  ├─ peercfg
│  │  │  │  │  │  └─ core.yaml
│  │  │  │  │  └─ podman-compose-couch-org3.yaml
│  │  │  │  ├─ compose-couch-org3.yaml
│  │  │  │  └─ docker
│  │  │  │     ├─ docker-compose-org3.yaml
│  │  │  │     ├─ docker-compose-couch-org3.yaml
│  │  │  │     ├─ peercfg
│  │  │  │     │  └─ core.yaml
│  │  │  │     └─ docker-compose-ca-org3.yaml
│  │  │  ├─ fabric-ca
│  │  │  │  ├─ registerEnroll.sh
│  │  │  │  └─ org3
│  │  │  │     └─ fabric-ca-server-config.yaml
│  │  │  ├─ addOrg3.sh
│  │  │  └─ ccp-generate.sh
│  │  ├─ bft-config
│  │  │  └─ configtx.yaml
│  │  ├─ setOrgEnv.sh
│  │  ├─ prometheus-grafana
│  │  │  ├─ grafana_db
│  │  │  │  └─ grafana.db
│  │  │  ├─ README.md
│  │  │  ├─ grafana
│  │  │  │  ├─ provisioning
│  │  │  │  │  ├─ dashboards
│  │  │  │  │  │  ├─ dashboard.yml
│  │  │  │  │  │  └─ hlf-performances.json
│  │  │  │  │  └─ datasources
│  │  │  │  │     └─ datasource.yml
│  │  │  │  └─ config.monitoring
│  │  │  ├─ prometheus
│  │  │  │  └─ prometheus.yml
│  │  │  └─ docker-compose.yaml
│  │  ├─ README.md
│  │  ├─ configtx
│  │  │  └─ configtx.yaml
│  │  ├─ organizations
│  │  │  ├─ ccp-template.yaml
│  │  │  ├─ cryptogen
│  │  │  │  ├─ crypto-config-org2.yaml
│  │  │  │  ├─ crypto-config-org1.yaml
│  │  │  │  └─ crypto-config-orderer.yaml
│  │  │  ├─ ccp-template.json
│  │  │  ├─ fabric-ca
│  │  │  │  ├─ org2
│  │  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  │  ├─ registerEnroll.sh
│  │  │  │  ├─ ordererOrg
│  │  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  │  └─ org1
│  │  │  │     └─ fabric-ca-server-config.yaml
│  │  │  ├─ cfssl
│  │  │  │  ├─ ca-peer.json
│  │  │  │  ├─ registerEnroll.sh
│  │  │  │  ├─ peer-csr-template.json
│  │  │  │  ├─ admin-csr-template.json
│  │  │  │  ├─ ca-orderer.json
│  │  │  │  ├─ orderer-csr-template.json
│  │  │  │  ├─ cert-signing-config.json
│  │  │  │  └─ client-csr-template.json
│  │  │  └─ ccp-generate.sh
│  │  ├─ network.sh
│  │  ├─ system-genesis-block
│  │  ├─ compose
│  │  │  ├─ podman
│  │  │  │  ├─ podman-compose-test-net.yaml
│  │  │  │  └─ peercfg
│  │  │  │     └─ core.yaml
│  │  │  ├─ compose-ca.yaml
│  │  │  ├─ compose-couch.yaml
│  │  │  ├─ compose-bft-test-net.yaml
│  │  │  ├─ docker
│  │  │  │  ├─ docker-compose-test-net.yaml
│  │  │  │  ├─ docker-compose-bft-test-net.yaml
│  │  │  │  └─ peercfg
│  │  │  │     └─ core.yaml
│  │  │  └─ compose-test-net.yaml
│  │  ├─ network.config
│  │  ├─ scripts
│  │  │  ├─ configUpdate.sh
│  │  │  ├─ deployCC.sh
│  │  │  ├─ utils.sh
│  │  │  ├─ orderer.sh
│  │  │  ├─ orderer3.sh
│  │  │  ├─ ccutils.sh
│  │  │  ├─ createChannel.sh
│  │  │  ├─ packageCC.sh
│  │  │  ├─ add_new_orderer_to_config.py
│  │  │  ├─ setAnchorPeer.sh
│  │  │  ├─ org3-scripts
│  │  │  │  ├─ updateChannelConfig.sh
│  │  │  │  └─ joinChannel.sh
│  │  │  ├─ orderer2.sh
│  │  │  ├─ envVar.sh
│  │  │  ├─ deployCCAAS.sh
│  │  │  ├─ orderer4.sh
│  │  │  └─ pkgcc.sh
│  │  ├─ CHAINCODE_AS_A_SERVICE_TUTORIAL.md
│  │  └─ monitordocker.sh
│  ├─ README.md
│  ├─ CODE_OF_CONDUCT.md
│  ├─ test-network-nano-bash
│  │  ├─ configureExternalBuilders.sh
│  │  ├─ chaincode_interaction.sh
│  │  ├─ peer2admin.sh
│  │  ├─ bft-config
│  │  │  └─ configtx.yaml
│  │  ├─ external_builders
│  │  │  ├─ golang
│  │  │  │  └─ bin
│  │  │  │     ├─ detect
│  │  │  │     ├─ run
│  │  │  │     ├─ release
│  │  │  │     └─ build
│  │  │  ├─ core_yaml_change.yaml
│  │  │  └─ node
│  │  │     └─ bin
│  │  │        ├─ detect
│  │  │        ├─ run
│  │  │        ├─ release
│  │  │        └─ build
│  │  ├─ ordererca.sh
│  │  ├─ peer4.sh
│  │  ├─ peer2.sh
│  │  ├─ peer1admin.sh
│  │  ├─ README.md
│  │  ├─ install&approve&commit_chaincode_peer1.sh
│  │  ├─ orderer3.sh
│  │  ├─ network.sh
│  │  ├─ configtx.yaml
│  │  ├─ peer3admin.sh
│  │  ├─ join_orderers.sh
│  │  ├─ crypto-config.yaml
│  │  ├─ peer1.sh
│  │  ├─ orderer1.sh
│  │  ├─ org1ca.sh
│  │  ├─ orderer2.sh
│  │  ├─ peer3.sh
│  │  ├─ ca
│  │  │  ├─ ccp-template.yaml
│  │  │  ├─ ca_utils.sh
│  │  │  ├─ createEnrollments.sh
│  │  │  ├─ ccp-template.json
│  │  │  ├─ ca_config
│  │  │  │  ├─ tlsca
│  │  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  │  └─ ca
│  │  │  │     └─ fabric-ca-server-config.yaml
│  │  │  ├─ config.yaml
│  │  │  └─ ccp-generate.sh
│  │  ├─ generate_artifacts.sh
│  │  ├─ terminal_setup.png
│  │  ├─ join_channel.sh
│  │  ├─ peer4admin.sh
│  │  ├─ org2ca.sh
│  │  ├─ orderer4.sh
│  │  ├─ chaincode-external
│  │  │  ├─ connection.json
│  │  │  └─ metadata.json
│  │  └─ ca_terminal_setup.png
│  ├─ SECURITY.md
│  ├─ asset-transfer-events
│  │  ├─ application-gateway-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ app.ts
│  │  │  │  └─ connect.ts
│  │  │  └─ tsconfig.json
│  │  ├─ README.md
│  │  ├─ application-gateway-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ pom.xml
│  │  │  ├─ src
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        ├─ Connections.java
│  │  │  │        └─ App.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  └─ gradlew.bat
│  │  ├─ chaincode-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ org
│  │  │  │           └─ hyperledger
│  │  │  │              └─ fabric
│  │  │  │                 └─ samples
│  │  │  │                    └─ events
│  │  │  │                       ├─ Asset.java
│  │  │  │                       └─ AssetTransfer.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  ├─ gradlew.bat
│  │  │  └─ config
│  │  │     └─ checkstyle
│  │  │        ├─ suppressions.xml
│  │  │        └─ checkstyle.xml
│  │  ├─ application-gateway-go
│  │  │  ├─ app.go
│  │  │  ├─ go.sum
│  │  │  ├─ go.mod
│  │  │  └─ connect.go
│  │  ├─ chaincode-javascript
│  │  │  ├─ test
│  │  │  │  └─ assetTransferEvents.test.js
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ index.js
│  │  │  ├─ lib
│  │  │  │  └─ assetTransferEvents.js
│  │  │  └─ .eslintignore
│  │  └─ chaincode-go
│  │     ├─ assetTransferEvents.go
│  │     ├─ go.sum
│  │     ├─ chaincode
│  │     │  └─ smartcontract.go
│  │     └─ go.mod
│  ├─ auction-simple
│  │  ├─ README.md
│  │  ├─ application-javascript
│  │  │  ├─ queryBid.js
│  │  │  ├─ submitBid.js
│  │  │  ├─ package.json
│  │  │  ├─ closeAuction.js
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ registerEnrollUser.js
│  │  │  ├─ queryAuction.js
│  │  │  ├─ createAuction.js
│  │  │  ├─ bid.js
│  │  │  ├─ enrollAdmin.js
│  │  │  ├─ .eslintignore
│  │  │  ├─ revealBid.js
│  │  │  └─ endAuction.js
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ smart-contract
│  │     │  ├─ utils.go
│  │     │  ├─ auction.go
│  │     │  └─ auctionQueries.go
│  │     ├─ go.mod
│  │     └─ smartContract.go
│  ├─ off_chain_data
│  │  ├─ application-go
│  │  │  ├─ utils.go
│  │  │  ├─ parser
│  │  │  │  ├─ payload.go
│  │  │  │  ├─ readWriteSet.go
│  │  │  │  ├─ transaction.go
│  │  │  │  ├─ namespaceReadWriteSet.go
│  │  │  │  ├─ block_test.go
│  │  │  │  ├─ endorserTransaction.go
│  │  │  │  └─ block.go
│  │  │  ├─ app.go
│  │  │  ├─ go.sum
│  │  │  ├─ contract
│  │  │  │  ├─ model.go
│  │  │  │  └─ contract.go
│  │  │  ├─ transact.go
│  │  │  ├─ store.go
│  │  │  ├─ go.mod
│  │  │  ├─ connect.go
│  │  │  ├─ getAllAssets.go
│  │  │  └─ listen.go
│  │  ├─ README.md
│  │  ├─ application-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ listen.ts
│  │  │  │  ├─ expectedError.ts
│  │  │  │  ├─ transact.ts
│  │  │  │  ├─ getAllAssets.ts
│  │  │  │  ├─ contract.ts
│  │  │  │  ├─ app.ts
│  │  │  │  ├─ blockParser.ts
│  │  │  │  ├─ connect.ts
│  │  │  │  └─ utils.ts
│  │  │  └─ tsconfig.json
│  │  └─ application-java
│  │     ├─ gradlew
│  │     ├─ settings.gradle
│  │     ├─ app
│  │     │  ├─ pom.xml
│  │     │  ├─ src
│  │     │  │  └─ main
│  │     │  │     └─ java
│  │     │  │        ├─ BlockProcessor.java
│  │     │  │        ├─ parser
│  │     │  │        │  ├─ ParsedPayload.java
│  │     │  │        │  ├─ ParsedBlock.java
│  │     │  │        │  ├─ ParsedTransaction.java
│  │     │  │        │  ├─ BlockParser.java
│  │     │  │        │  ├─ ParsedReadWriteSet.java
│  │     │  │        │  ├─ NamespaceReadWriteSet.java
│  │     │  │        │  ├─ Transaction.java
│  │     │  │        │  ├─ Utils.java
│  │     │  │        │  ├─ Block.java
│  │     │  │        │  └─ ParsedTransactionAction.java
│  │     │  │        ├─ Write.java
│  │     │  │        ├─ Command.java
│  │     │  │        ├─ Store.java
│  │     │  │        ├─ TransactionProcessor.java
│  │     │  │        ├─ Utils.java
│  │     │  │        ├─ Asset.java
│  │     │  │        ├─ TransactApp.java
│  │     │  │        ├─ AssetTransferBasic.java
│  │     │  │        ├─ GetAllAssets.java
│  │     │  │        ├─ Listen.java
│  │     │  │        ├─ ExpectedException.java
│  │     │  │        ├─ Transact.java
│  │     │  │        ├─ Connections.java
│  │     │  │        └─ App.java
│  │     │  └─ build.gradle
│  │     ├─ gradle
│  │     │  └─ wrapper
│  │     │     ├─ gradle-wrapper.properties
│  │     │     └─ gradle-wrapper.jar
│  │     ├─ gradlew.bat
│  │     └─ config
│  │        └─ checkstyle
│  │           ├─ java-copyright-header.txt
│  │           └─ checkstyle.xml
│  ├─ asset-transfer-private-data
│  │  ├─ application-gateway-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ app.ts
│  │  │  │  └─ connect.ts
│  │  │  ├─ README.md
│  │  │  └─ tsconfig.json
│  │  ├─ README.md
│  │  ├─ chaincode-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ Readme.md
│  │  │  ├─ src
│  │  │  │  ├─ transferAgreement.ts
│  │  │  │  ├─ assetTransfer.ts
│  │  │  │  ├─ assetTransferDetails.ts
│  │  │  │  ├─ assetTransferTransientInput.ts
│  │  │  │  ├─ asset.ts
│  │  │  │  ├─ index.ts
│  │  │  │  └─ utils.ts
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ .dockerignore
│  │  │  ├─ docker
│  │  │  │  └─ docker-entrypoint.sh
│  │  │  ├─ Dockerfile
│  │  │  ├─ tsconfig.json
│  │  │  └─ collections_config.json
│  │  ├─ chaincode-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  ├─ test
│  │  │  │  │  ├─ resources
│  │  │  │  │  │  └─ mockito-extensions
│  │  │  │  │  │     └─ org.mockito.plugins.MockMaker
│  │  │  │  │  └─ java
│  │  │  │  │     └─ org
│  │  │  │  │        └─ hyperledger
│  │  │  │  │           └─ fabric
│  │  │  │  │              └─ samples
│  │  │  │  │                 └─ privatedata
│  │  │  │  │                    └─ AssetTransferTest.java
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ org
│  │  │  │           └─ hyperledger
│  │  │  │              └─ fabric
│  │  │  │                 └─ samples
│  │  │  │                    └─ privatedata
│  │  │  │                       ├─ TransferAgreement.java
│  │  │  │                       ├─ AssetPrivateDetails.java
│  │  │  │                       ├─ Asset.java
│  │  │  │                       └─ AssetTransfer.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  ├─ gradlew.bat
│  │  │  ├─ config
│  │  │  │  └─ checkstyle
│  │  │  │     ├─ suppressions.xml
│  │  │  │     └─ checkstyle.xml
│  │  │  ├─ META-INF
│  │  │  │  └─ statedb
│  │  │  │     └─ couchdb
│  │  │  │        └─ collections
│  │  │  │           └─ assetCollection
│  │  │  │              └─ indexes
│  │  │  │                 └─ indexOwner.json
│  │  │  └─ collections_config.json
│  │  ├─ application-gateway-go
│  │  │  ├─ app.go
│  │  │  ├─ go.sum
│  │  │  ├─ go.mod
│  │  │  └─ connect.go
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ README.md
│  │     ├─ chaincode
│  │     │  ├─ mocks
│  │     │  │  ├─ statequeryiterator.go
│  │     │  │  ├─ transaction.go
│  │     │  │  ├─ clientIdentity.go
│  │     │  │  └─ chaincodestub.go
│  │     │  ├─ asset_transfer_test.go
│  │     │  ├─ asset_transfer.go
│  │     │  ├─ asset_queries_test.go
│  │     │  └─ asset_queries.go
│  │     ├─ go.mod
│  │     ├─ main.go
│  │     ├─ META-INF
│  │     │  └─ statedb
│  │     │     └─ couchdb
│  │     │        └─ collections
│  │     │           └─ assetCollection
│  │     │              └─ indexes
│  │     │                 └─ indexOwner.json
│  │     └─ collections_config.json
│  ├─ test-network-k8s
│  │  ├─ docs
│  │  │  ├─ CA.md
│  │  │  ├─ KUBERNETES.md
│  │  │  ├─ APPLICATIONS.md
│  │  │  ├─ images
│  │  │  │  └─ test-network.png
│  │  │  ├─ CHAINCODE_AS_A_SERVICE.md
│  │  │  ├─ README.md
│  │  │  ├─ CALIPER.md
│  │  │  ├─ CHAINCODE.md
│  │  │  ├─ TEST_NETWORK.md
│  │  │  ├─ BFT_ORDERERS.md
│  │  │  ├─ CHANNELS.md
│  │  │  └─ HIGH_AVAILABILITY.md
│  │  ├─ README.md
│  │  ├─ kube
│  │  │  ├─ org2
│  │  │  │  ├─ org2-peer1.yaml
│  │  │  │  ├─ org2-ca.yaml
│  │  │  │  ├─ org2-cc-template.yaml
│  │  │  │  ├─ org2-install-k8s-builder.yaml
│  │  │  │  ├─ org2-job-scrub-fabric-volumes.yaml
│  │  │  │  ├─ org2-peer2.yaml
│  │  │  │  └─ org2-tls-cert-issuer.yaml
│  │  │  ├─ ns-test-network.yaml
│  │  │  ├─ application-deployment.yaml
│  │  │  ├─ pvc-fabric-org1.yaml
│  │  │  ├─ pvc-fabric-org2.yaml
│  │  │  ├─ root-tls-cert-issuer.yaml
│  │  │  ├─ ingress-nginx-k3s.yaml
│  │  │  ├─ fabric-builder-role.yaml
│  │  │  ├─ pvc-fabric-org0.yaml
│  │  │  ├─ fabric-builder-rolebinding.yaml
│  │  │  ├─ org0
│  │  │  │  ├─ org0-tls-cert-issuer.yaml
│  │  │  │  ├─ org0-job-scrub-fabric-volumes.yaml
│  │  │  │  ├─ org0-orderer1.yaml
│  │  │  │  ├─ org0-orderer3.yaml
│  │  │  │  ├─ org0-orderer2.yaml
│  │  │  │  ├─ org0-orderer4.yaml
│  │  │  │  └─ org0-ca.yaml
│  │  │  ├─ org1
│  │  │  │  ├─ org1-ca.yaml
│  │  │  │  ├─ org1-peer1.yaml
│  │  │  │  ├─ org1-peer2.yaml
│  │  │  │  ├─ org1-job-scrub-fabric-volumes.yaml
│  │  │  │  ├─ org1-cc-template.yaml
│  │  │  │  ├─ org1-tls-cert-issuer.yaml
│  │  │  │  └─ org1-install-k8s-builder.yaml
│  │  │  ├─ fabric-rest-sample.yaml
│  │  │  └─ ingress-nginx-kind.yaml
│  │  ├─ scripts
│  │  │  ├─ rest_sample.sh
│  │  │  ├─ utils.sh
│  │  │  ├─ chaincode.sh
│  │  │  ├─ cluster.sh
│  │  │  ├─ set_anchor_peer.sh
│  │  │  ├─ ccp-template.json
│  │  │  ├─ fabric_config.sh
│  │  │  ├─ prereqs.sh
│  │  │  ├─ fabric_CAs.sh
│  │  │  ├─ test_network.sh
│  │  │  ├─ application_connection.sh
│  │  │  ├─ kind.sh
│  │  │  └─ channel.sh
│  │  ├─ config
│  │  │  ├─ org2
│  │  │  │  ├─ core.yaml
│  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  ├─ org0
│  │  │  │  ├─ configtx-template.yaml
│  │  │  │  ├─ bft
│  │  │  │  │  └─ configtx-template.yaml
│  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  └─ org1
│  │  │     ├─ core.yaml
│  │  │     └─ fabric-ca-server-config.yaml
│  │  └─ network
│  ├─ builders
│  │  └─ ccaas
│  │     └─ bin
│  │        ├─ detect
│  │        ├─ release
│  │        └─ build
│  ├─ ci
│  │  └─ scripts
│  │     ├─ run-test-network-off-chain.sh
│  │     ├─ lint-java.sh
│  │     ├─ lint-shell.sh
│  │     ├─ run-test-network-private.sh
│  │     ├─ run-test-network-events.sh
│  │     ├─ lint-typescript.sh
│  │     ├─ run-test-network-ledger.sh
│  │     ├─ run-test-network-basic.sh
│  │     ├─ run-test-network-sbe.sh
│  │     ├─ run-test-network-secured.sh
│  │     ├─ lint.sh
│  │     ├─ run-k8s-test-network-basic.sh
│  │     ├─ lint-javascript.sh
│  │     ├─ lint-go.sh
│  │     └─ run-test-network-hsm.sh
│  ├─ CONTRIBUTING.md
│  ├─ .editorconfig
│  ├─ CHANGELOG.md
│  ├─ token-erc-721
│  │  ├─ README.md
│  │  ├─ chaincode-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  ├─ test
│  │  │  │  │  ├─ resources
│  │  │  │  │  │  └─ mockito-extensions
│  │  │  │  │  │     └─ org.mockito.plugins.MockMaker
│  │  │  │  │  └─ java
│  │  │  │  │     └─ org
│  │  │  │  │        └─ hyperledger
│  │  │  │  │           └─ fabric
│  │  │  │  │              └─ samples
│  │  │  │  │                 └─ erc721
│  │  │  │  │                    └─ ERC721TokenContractTest.java
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ org
│  │  │  │           └─ hyperledger
│  │  │  │              └─ fabric
│  │  │  │                 └─ samples
│  │  │  │                    └─ erc721
│  │  │  │                       ├─ utils
│  │  │  │                       │  └─ ContractUtility.java
│  │  │  │                       ├─ ERC721TokenContract.java
│  │  │  │                       ├─ models
│  │  │  │                       │  ├─ NFT.java
│  │  │  │                       │  ├─ Transfer.java
│  │  │  │                       │  └─ Approval.java
│  │  │  │                       ├─ ContractConstants.java
│  │  │  │                       └─ ContractErrors.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  ├─ docker
│  │  │  │  └─ docker-entrypoint.sh
│  │  │  ├─ Dockerfile
│  │  │  ├─ gradlew.bat
│  │  │  └─ config
│  │  │     └─ checkstyle
│  │  │        ├─ suppressions.xml
│  │  │        └─ checkstyle.xml
│  │  ├─ chaincode-javascript
│  │  │  ├─ test
│  │  │  │  └─ tokenERC721.test.js
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ index.js
│  │  │  ├─ .editorconfig
│  │  │  ├─ lib
│  │  │  │  └─ tokenERC721.js
│  │  │  └─ .eslintignore
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ chaincode
│  │     │  ├─ erc721-contract.go
│  │     │  ├─ erc721-contract_test.go
│  │     │  └─ erc721.go
│  │     ├─ go.mod
│  │     └─ main.go
│  ├─ token-utxo
│  │  ├─ README.md
│  │  └─ chaincode-go
│  │     ├─ token_utxo.go
│  │     ├─ go.sum
│  │     ├─ chaincode
│  │     │  └─ token_contract.go
│  │     └─ go.mod
│  ├─ full-stack-asset-transfer-guide
│  │  ├─ SETUP.md
│  │  ├─ docs
│  │  │  ├─ images
│  │  │  │  ├─ ApplicationDev.pptx
│  │  │  │  ├─ cloud-vm-with-operator-network.png
│  │  │  │  ├─ multipass-test-network.png
│  │  │  │  ├─ readme_diagram.png
│  │  │  │  ├─ multipass-operator-network.png
│  │  │  │  ├─ CloudReady.pptx
│  │  │  │  ├─ ApplicationDev
│  │  │  │  │  ├─ fabric-gateway-model.png
│  │  │  │  │  ├─ fabric-gateway-deployment.png
│  │  │  │  │  ├─ legacy-sdk-model.png
│  │  │  │  │  └─ transaction-submit-flow.png
│  │  │  │  └─ CloudReady
│  │  │  │     ├─ 12-kube-ec2-vm.png
│  │  │  │     ├─ 20-fabric.png
│  │  │  │     ├─ 40-gateway-client-app.png
│  │  │  │     ├─ kube-ec2-vm.png
│  │  │  │     ├─ 30-chaincode.png
│  │  │  │     ├─ 10-kube.png
│  │  │  │     └─ 00-cloud-ready-2.png
│  │  │  ├─ tips-for-windows-dev.md
│  │  │  ├─ SmartContractDev
│  │  │  │  ├─ 03-Test-And-Debug-Reference-ES.md
│  │  │  │  ├─ 00-Introduction-ES.md
│  │  │  │  ├─ 01-Exercise-Getting-Started-ES.md
│  │  │  │  ├─ 02-Exercise-Adding-tx-function.md
│  │  │  │  ├─ 01-Exercise-Getting-Started.md
│  │  │  │  ├─ 02-Exercise-Adding-tx-function-ES.md
│  │  │  │  ├─ 00-Introduction.md
│  │  │  │  └─ 03-Test-And-Debug-Reference.md
│  │  │  ├─ ApplicationDev
│  │  │  │  ├─ 01-FabricGateway.md
│  │  │  │  ├─ 01-FabricGateway-ES.md
│  │  │  │  ├─ 04-Exercise-AssetTransfer-ES.md
│  │  │  │  ├─ 04-Exercise-AssetTransfer.md
│  │  │  │  ├─ README.md
│  │  │  │  ├─ 06-Exercise-ChaincodeEvents.md
│  │  │  │  ├─ 03-ApplicationOverview-ES.md
│  │  │  │  ├─ 05-ChaincodeEvents-ES.md
│  │  │  │  ├─ 06-Exercise-ChaincodeEvents-ES.md
│  │  │  │  ├─ 05-ChaincodeEvents.md
│  │  │  │  ├─ 02-Exercise-RunApplication.md
│  │  │  │  ├─ 03-ApplicationOverview.md
│  │  │  │  └─ 02-Exercise-RunApplication-ES.md
│  │  │  └─ CloudReady
│  │  │     ├─ 31-fabric-ansible-chaincode.md
│  │  │     ├─ 10-kube-zh.md
│  │  │     ├─ 20-fabric.md
│  │  │     ├─ README.md
│  │  │     ├─ 21-fabric-operations-console.md
│  │  │     ├─ 00-setup-zh.md
│  │  │     ├─ 00-setup.md
│  │  │     ├─ 50-OpenShift-Deployment.md
│  │  │     ├─ 90-teardown.md
│  │  │     ├─ 20-fabric-zh.md
│  │  │     ├─ 40-bananas-zh.md
│  │  │     ├─ 40-bananas.md
│  │  │     ├─ 12-kube-ec2-vm.md
│  │  │     ├─ 11-kube-multipass.md
│  │  │     ├─ 13-kube-public-cloud.md
│  │  │     ├─ 30-chaincode.md
│  │  │     ├─ 10-kube.md
│  │  │     ├─ 22-fabric-ansible-collection.md
│  │  │     └─ 30-chaincode-zh.md
│  │  ├─ contracts
│  │  │  └─ asset-transfer-typescript
│  │  │     ├─ eslint.config.mjs
│  │  │     ├─ package.json
│  │  │     ├─ asset-transfer-chaincode-vars.yml
│  │  │     ├─ src
│  │  │     │  ├─ assetTransfer.ts
│  │  │     │  ├─ untyped.d.ts
│  │  │     │  ├─ asset.ts
│  │  │     │  └─ index.ts
│  │  │     ├─ npm-shrinkwrap.json
│  │  │     ├─ docker
│  │  │     │  └─ docker-entrypoint.sh
│  │  │     ├─ Dockerfile
│  │  │     └─ tsconfig.json
│  │  ├─ README.md
│  │  ├─ check.sh
│  │  ├─ checks
│  │  │  ├─ check-kube.sh
│  │  │  ├─ utils.sh
│  │  │  ├─ check-network.sh
│  │  │  └─ check-chaincode.sh
│  │  ├─ justfile
│  │  ├─ tests
│  │  │  ├─ 10-appdev-e2e.sh
│  │  │  ├─ 30-ansible-e2e.sh
│  │  │  ├─ 20-cloud-e2e.sh
│  │  │  ├─ 00-chaincode-e2e.sh
│  │  │  └─ 40-console.sh
│  │  ├─ applications
│  │  │  ├─ frontend
│  │  │  │  ├─ screenshots
│  │  │  │  │  ├─ list.png
│  │  │  │  │  └─ Create.png
│  │  │  │  ├─ .browserslistrc
│  │  │  │  ├─ package.json
│  │  │  │  ├─ src
│  │  │  │  │  ├─ favicon.ico
│  │  │  │  │  ├─ styles.scss
│  │  │  │  │  ├─ assets
│  │  │  │  │  ├─ polyfills.ts
│  │  │  │  │  ├─ app
│  │  │  │  │  │  ├─ app.component.ts
│  │  │  │  │  │  ├─ app.component.html
│  │  │  │  │  │  ├─ app.component.spec.ts
│  │  │  │  │  │  ├─ asset-dialog
│  │  │  │  │  │  │  ├─ asset-dialog.component.ts
│  │  │  │  │  │  │  ├─ asset-dialog.component.scss
│  │  │  │  │  │  │  ├─ asset-dialog.component.html
│  │  │  │  │  │  │  └─ asset-dialog.component.spec.ts
│  │  │  │  │  │  ├─ app.module.ts
│  │  │  │  │  │  ├─ urls.ts
│  │  │  │  │  │  └─ app.component.scss
│  │  │  │  │  ├─ index.html
│  │  │  │  │  ├─ main.ts
│  │  │  │  │  ├─ test.ts
│  │  │  │  │  └─ environments
│  │  │  │  │     ├─ environment.prod.ts
│  │  │  │  │     └─ environment.ts
│  │  │  │  ├─ README.md
│  │  │  │  ├─ karma.conf.js
│  │  │  │  ├─ tsconfig.app.json
│  │  │  │  ├─ .editorconfig
│  │  │  │  ├─ tsconfig.spec.json
│  │  │  │  ├─ angular.json
│  │  │  │  ├─ Dockerfile
│  │  │  │  └─ tsconfig.json
│  │  │  ├─ ping-chaincode
│  │  │  │  ├─ package.json
│  │  │  │  ├─ src
│  │  │  │  │  ├─ jsonid-adapter.ts
│  │  │  │  │  ├─ fabric-connection-profile.ts
│  │  │  │  │  └─ app.ts
│  │  │  │  └─ tsconfig.json
│  │  │  ├─ rest-api
│  │  │  │  ├─ package.json
│  │  │  │  ├─ src
│  │  │  │  │  ├─ server.ts
│  │  │  │  │  ├─ connection.ts
│  │  │  │  │  └─ app.ts
│  │  │  │  ├─ deployment.yaml
│  │  │  │  ├─ README.md
│  │  │  │  ├─ renovate.json
│  │  │  │  ├─ asset-transfer.postman_collection.json
│  │  │  │  ├─ Dockerfile
│  │  │  │  ├─ LICENSE
│  │  │  │  └─ tsconfig.json
│  │  │  ├─ conga-cards
│  │  │  │  ├─ package.json
│  │  │  │  ├─ images
│  │  │  │  │  └─ interaction.png
│  │  │  │  ├─ assets
│  │  │  │  │  ├─ bananomatopoeia.png
│  │  │  │  │  ├─ blockbert.png
│  │  │  │  │  ├─ template.png
│  │  │  │  │  ├─ darth-conga.png
│  │  │  │  │  ├─ no-pun-intended.png
│  │  │  │  │  ├─ count-blockula.png
│  │  │  │  │  ├─ block-norris.png
│  │  │  │  │  └─ appleplectic.png
│  │  │  │  ├─ src
│  │  │  │  │  ├─ expectedError.ts
│  │  │  │  │  ├─ contract.ts
│  │  │  │  │  ├─ config.ts
│  │  │  │  │  ├─ app.ts
│  │  │  │  │  ├─ commands
│  │  │  │  │  │  ├─ create.ts
│  │  │  │  │  │  ├─ getAllAssets.ts
│  │  │  │  │  │  ├─ delete.ts
│  │  │  │  │  │  ├─ discord.ts
│  │  │  │  │  │  ├─ transfer.ts
│  │  │  │  │  │  ├─ index.ts
│  │  │  │  │  │  └─ read.ts
│  │  │  │  │  ├─ connect.ts
│  │  │  │  │  └─ utils.ts
│  │  │  │  ├─ README.md
│  │  │  │  ├─ .eslintrc.js
│  │  │  │  ├─ hooks
│  │  │  │  │  └─ captain-hook.json
│  │  │  │  └─ tsconfig.json
│  │  │  └─ trader-typescript
│  │  │     ├─ eslint.config.mjs
│  │  │     ├─ package.json
│  │  │     ├─ src
│  │  │     │  ├─ expectedError.ts
│  │  │     │  ├─ contract.ts
│  │  │     │  ├─ config.ts
│  │  │     │  ├─ app.ts
│  │  │     │  ├─ commands
│  │  │     │  │  ├─ create.ts
│  │  │     │  │  ├─ listen.ts
│  │  │     │  │  ├─ transact.ts
│  │  │     │  │  ├─ getAllAssets.ts
│  │  │     │  │  ├─ delete.ts
│  │  │     │  │  ├─ transfer.ts
│  │  │     │  │  ├─ index.ts
│  │  │     │  │  └─ read.ts
│  │  │     │  ├─ connect.ts
│  │  │     │  └─ utils.ts
│  │  │     ├─ README.md
│  │  │     └─ tsconfig.json
│  │  ├─ LICENSE
│  │  └─ infrastructure
│  │     ├─ multipass-cloud-config.yaml
│  │     ├─ configuration
│  │     │  ├─ fabric-org2-vars.yml
│  │     │  ├─ fabric-ordering-org-vars.yml
│  │     │  ├─ operator-console-vars.yml
│  │     │  ├─ fabric-sail.yaml
│  │     │  ├─ fabric-org1-vars.yml
│  │     │  └─ fabric-common-vars.yml
│  │     ├─ production_chaincode_playbooks
│  │     │  ├─ 22-register-application.yml
│  │     │  ├─ 20-install-and-approve-chaincode.yml
│  │     │  ├─ 19-install-and-approve-chaincode.yml
│  │     │  ├─ asset-transfer_appid.json
│  │     │  └─ 21-commit-chaincode.yml
│  │     ├─ kind_with_nginx.sh
│  │     ├─ operator_console_playbooks
│  │     │  ├─ 02-console-install.yml
│  │     │  └─ 01-operator-install.yml
│  │     ├─ kind_console_ingress
│  │     │  ├─ templates
│  │     │  │  ├─ ingress
│  │     │  │  │  ├─ ingress-nginx-controller.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  └─ coredns
│  │     │  │     └─ coredns.yaml.j2
│  │     │  └─ 90-KIND-ingress.yml
│  │     ├─ setup_storage_classes.sh
│  │     ├─ ec2-cloud-config.yaml
│  │     ├─ sample-network
│  │     │  ├─ scripts
│  │     │  │  ├─ rest_sample.sh
│  │     │  │  ├─ utils.sh
│  │     │  │  ├─ frontend_build.sh
│  │     │  │  ├─ frontend_deployment.yaml
│  │     │  │  ├─ console.sh
│  │     │  │  ├─ prereqs.sh
│  │     │  │  ├─ sample_network.sh
│  │     │  │  ├─ channel.sh
│  │     │  │  └─ rest_deployment.yaml
│  │     │  ├─ config
│  │     │  │  ├─ orderers
│  │     │  │  │  ├─ org0-orderers.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  ├─ gateway
│  │     │  │  │  ├─ org1-peer-gateway.yaml
│  │     │  │  │  ├─ org2-peer-gateway.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  ├─ cas
│  │     │  │  │  ├─ org1-ca.yaml
│  │     │  │  │  ├─ org2-ca.yaml
│  │     │  │  │  ├─ kustomization.yaml
│  │     │  │  │  └─ org0-ca.yaml
│  │     │  │  ├─ configtx-template.yaml
│  │     │  │  ├─ peers
│  │     │  │  │  ├─ org2-peer1.yaml
│  │     │  │  │  ├─ org1-peer1.yaml
│  │     │  │  │  ├─ org1-peer2.yaml
│  │     │  │  │  ├─ org2-peer2.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  ├─ console
│  │     │  │  │  ├─ kustomization.yaml
│  │     │  │  │  └─ hlf-operations-console.yaml
│  │     │  │  ├─ rbac
│  │     │  │  │  ├─ fabric-operator-clusterrolebinding.yaml
│  │     │  │  │  ├─ fabric-operator-serviceaccount.yaml
│  │     │  │  │  ├─ fabric-operator-clusterrole.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  ├─ core.yaml
│  │     │  │  └─ manager
│  │     │  │     ├─ fabric-operator-manager.yaml
│  │     │  │     └─ kustomization.yaml
│  │     │  └─ network
│  │     ├─ fabric_network_playbooks
│  │     │  ├─ 02-create-endorsing-organization-components.yml
│  │     │  ├─ 15-lifecycle-endorsement-policy.json.j2
│  │     │  ├─ 17-join-peer-to-channel.yml
│  │     │  ├─ 09-admins-policy.json.j2
│  │     │  ├─ 15-add-organization-to-channel.yml
│  │     │  ├─ 11-add-anchor-peer-to-channel.yml
│  │     │  ├─ 09-writers-policy.json.j2
│  │     │  ├─ 09-readers-policy.json.j2
│  │     │  ├─ 16-import-ordering-service.yml
│  │     │  ├─ 09-create-channel.yml
│  │     │  ├─ 09-endorsement-policy.json.j2
│  │     │  ├─ 15-admins-policy.json.j2
│  │     │  ├─ 18-add-anchor-peer-to-channel.yml
│  │     │  ├─ 05-enable-capabilities.yml
│  │     │  ├─ 15-endorsement-policy.json.j2
│  │     │  ├─ 01-create-ordering-organization-components.yml
│  │     │  ├─ 10-join-peer-to-channel.yml
│  │     │  ├─ 12-create-endorsing-organization-components.yml
│  │     │  ├─ 09-lifecycle-endorsement-policy.json.j2
│  │     │  ├─ 06-add-organization-to-consortium.yml
│  │     │  ├─ 15-writers-policy.json.j2
│  │     │  ├─ 15-readers-policy.json.j2
│  │     │  └─ 00-complete.yml
│  │     └─ pkgcc.sh
│  ├─ high-throughput
│  │  ├─ application-go
│  │  │  ├─ app.go
│  │  │  ├─ go.sum
│  │  │  ├─ go.mod
│  │  │  └─ connect.go
│  │  ├─ README.md
│  │  ├─ startFabric.sh
│  │  ├─ chaincode-go
│  │  │  ├─ go.sum
│  │  │  ├─ go.mod
│  │  │  └─ high-throughput.go
│  │  └─ networkDown.sh
│  ├─ asset-transfer-secured-agreement
│  │  ├─ application-gateway-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ contractWrapper.ts
│  │  │  │  ├─ app.ts
│  │  │  │  ├─ connect.ts
│  │  │  │  └─ utils.ts
│  │  │  └─ tsconfig.json
│  │  ├─ README.md
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ README.md
│  │     ├─ go.mod
│  │     ├─ asset_transfer.go
│  │     └─ asset_transfer_queries.go
│  ├─ LICENSE
│  ├─ auction-dutch
│  │  ├─ chaincode-go-auditor
│  │  │  ├─ go.sum
│  │  │  ├─ smart-contract
│  │  │  │  ├─ utils.go
│  │  │  │  ├─ auction.go
│  │  │  │  └─ auctionQueries.go
│  │  │  ├─ go.mod
│  │  │  └─ smartContract.go
│  │  ├─ README.md
│  │  ├─ application-javascript
│  │  │  ├─ endAuctionwithAuditor.js
│  │  │  ├─ queryBid.js
│  │  │  ├─ submitBid.js
│  │  │  ├─ package.json
│  │  │  ├─ closeAuction.js
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ registerEnrollUser.js
│  │  │  ├─ queryAuction.js
│  │  │  ├─ createAuction.js
│  │  │  ├─ bid.js
│  │  │  ├─ enrollAdmin.js
│  │  │  ├─ .eslintignore
│  │  │  ├─ revealBid.js
│  │  │  └─ endAuction.js
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ smart-contract
│  │     │  ├─ utils.go
│  │     │  ├─ auction.go
│  │     │  └─ auctionQueries.go
│  │     ├─ go.mod
│  │     └─ smartContract.go
│  ├─ asset-transfer-basic
│  │  ├─ application-gateway-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  └─ app.ts
│  │  │  └─ tsconfig.json
│  │  ├─ README.md
│  │  ├─ application-gateway-javascript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  └─ src
│  │  │     └─ app.js
│  │  ├─ application-gateway-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ pom.xml
│  │  │  ├─ src
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ App.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  └─ gradlew.bat
│  │  ├─ chaincode-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ assetTransfer.ts
│  │  │  │  ├─ asset.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ .dockerignore
│  │  │  ├─ docker
│  │  │  │  └─ docker-entrypoint.sh
│  │  │  ├─ Dockerfile
│  │  │  └─ tsconfig.json
│  │  ├─ chaincode-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  ├─ test
│  │  │  │  │  └─ java
│  │  │  │  │     └─ org
│  │  │  │  │        └─ hyperledger
│  │  │  │  │           └─ fabric
│  │  │  │  │              └─ samples
│  │  │  │  │                 └─ assettransfer
│  │  │  │  │                    ├─ AssetTest.java
│  │  │  │  │                    └─ AssetTransferTest.java
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ org
│  │  │  │           └─ hyperledger
│  │  │  │              └─ fabric
│  │  │  │                 └─ samples
│  │  │  │                    └─ assettransfer
│  │  │  │                       ├─ Asset.java
│  │  │  │                       └─ AssetTransfer.java
│  │  │  ├─ README.md
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  ├─ docker
│  │  │  │  └─ docker-entrypoint.sh
│  │  │  ├─ Dockerfile
│  │  │  ├─ gradlew.bat
│  │  │  └─ config
│  │  │     └─ checkstyle
│  │  │        ├─ suppressions.xml
│  │  │        └─ checkstyle.xml
│  │  ├─ rest-api-go
│  │  │  ├─ go.sum
│  │  │  ├─ README.md
│  │  │  ├─ go.mod
│  │  │  ├─ web
│  │  │  │  ├─ app.go
│  │  │  │  ├─ query.go
│  │  │  │  ├─ initialize.go
│  │  │  │  └─ invoke.go
│  │  │  └─ main.go
│  │  ├─ application-gateway-go
│  │  │  ├─ assetTransfer.go
│  │  │  ├─ go.sum
│  │  │  └─ go.mod
│  │  ├─ chaincode-javascript
│  │  │  ├─ test
│  │  │  │  └─ assetTransfer.test.js
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ index.js
│  │  │  ├─ lib
│  │  │  │  ├─ assetTransfer.js
│  │  │  │  └─ ehrChainCode.js
│  │  │  └─ .eslintignore
│  │  ├─ chaincode-go
│  │  │  ├─ assetTransfer.go
│  │  │  ├─ go.sum
│  │  │  ├─ chaincode
│  │  │  │  ├─ mocks
│  │  │  │  │  ├─ statequeryiterator.go
│  │  │  │  │  ├─ transaction.go
│  │  │  │  │  └─ chaincodestub.go
│  │  │  │  ├─ smartcontract.go
│  │  │  │  └─ smartcontract_test.go
│  │  │  └─ go.mod
│  │  ├─ rest-api-typescript
│  │  │  ├─ .eslintrc.json
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ auth.ts
│  │  │  │  ├─ server.ts
│  │  │  │  ├─ fabric.ts
│  │  │  │  ├─ errors.spec.ts
│  │  │  │  ├─ jobs.spec.ts
│  │  │  │  ├─ logger.ts
│  │  │  │  ├─ config.spec.ts
│  │  │  │  ├─ errors.ts
│  │  │  │  ├─ redis.ts
│  │  │  │  ├─ __tests__
│  │  │  │  │  └─ api.test.ts
│  │  │  │  ├─ jobs.ts
│  │  │  │  ├─ fabric.spec.ts
│  │  │  │  ├─ config.ts
│  │  │  │  ├─ redis.spec.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ jest.config.ts
│  │  │  ├─ README.md
│  │  │  ├─ package-lock.json
│  │  │  ├─ .editorconfig
│  │  │  ├─ .dockerignore
│  │  │  ├─ scripts
│  │  │  │  └─ generateEnv.sh
│  │  │  ├─ Dockerfile
│  │  │  ├─ tsconfig.json
│  │  │  ├─ docker-compose.yaml
│  │  │  └─ demo.http
│  │  └─ chaincode-external
│  │     ├─ crypto
│  │     ├─ docker-compose-chaincode.yaml
│  │     ├─ connection.json
│  │     ├─ assetTransfer.go
│  │     ├─ go.sum
│  │     ├─ README.md
│  │     ├─ sampleBuilder
│  │     │  └─ bin
│  │     │     ├─ detect
│  │     │     ├─ release
│  │     │     └─ build
│  │     ├─ metadata.json
│  │     ├─ go.mod
│  │     ├─ .dockerignore
│  │     └─ Dockerfile
│  ├─ hardware-security-module
│  │  ├─ application-go
│  │  │  ├─ go.sum
│  │  │  ├─ hsm-sample.go
│  │  │  └─ go.mod
│  │  ├─ README.md
│  │  ├─ application-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  └─ hsm-sample.ts
│  │  │  └─ tsconfig.json
│  │  ├─ scripts
│  │  │  └─ generate-hsm-user.sh
│  │  └─ ca-client-config
│  │     └─ fabric-ca-client-config-template.yaml
│  ├─ token-sdk
│  │  ├─ explorer
│  │  │  ├─ connection-profile
│  │  │  │  └─ test-network.json
│  │  │  ├─ config.json
│  │  │  └─ docker-compose.yaml
│  │  ├─ components.png
│  │  ├─ go.work.sum
│  │  ├─ README.md
│  │  ├─ auditor
│  │  │  ├─ go.sum
│  │  │  ├─ service
│  │  │  │  ├─ audit.go
│  │  │  │  ├─ balance.go
│  │  │  │  └─ history.go
│  │  │  ├─ go.mod
│  │  │  ├─ conf
│  │  │  │  └─ core.yaml
│  │  │  ├─ main.go
│  │  │  └─ oapi-server.yaml
│  │  ├─ owner
│  │  │  ├─ go.sum
│  │  │  ├─ service
│  │  │  │  ├─ transfer.go
│  │  │  │  ├─ accept.go
│  │  │  │  ├─ balance.go
│  │  │  │  ├─ history.go
│  │  │  │  └─ redeem.go
│  │  │  ├─ go.mod
│  │  │  ├─ conf
│  │  │  │  ├─ owner1
│  │  │  │  │  └─ core.yaml
│  │  │  │  └─ owner2
│  │  │  │     └─ core.yaml
│  │  │  ├─ main.go
│  │  │  └─ oapi-server.yaml
│  │  ├─ issuer
│  │  │  ├─ go.sum
│  │  │  ├─ service
│  │  │  │  └─ issue.go
│  │  │  ├─ go.mod
│  │  │  ├─ conf
│  │  │  │  └─ core.yaml
│  │  │  ├─ main.go
│  │  │  └─ oapi-server.yaml
│  │  ├─ transfer.png
│  │  ├─ go.work
│  │  ├─ compose-ca.yaml
│  │  ├─ e2e
│  │  │  ├─ go.sum
│  │  │  ├─ client.gen.go
│  │  │  ├─ oapi-client.yaml
│  │  │  ├─ go.mod
│  │  │  └─ e2e_test.go
│  │  ├─ .dockerignore
│  │  ├─ tokenchaincode
│  │  │  └─ Dockerfile
│  │  ├─ scripts
│  │  │  ├─ up.sh
│  │  │  ├─ down.sh
│  │  │  └─ enroll-users.sh
│  │  ├─ Dockerfile
│  │  ├─ docker-compose.yaml
│  │  ├─ dependencies.png
│  │  └─ swagger.yaml
│  ├─ config
│  │  ├─ configtx.yaml
│  │  ├─ orderer.yaml
│  │  └─ core.yaml
│  ├─ token-erc-1155
│  │  ├─ README.md
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ erc1155.go
│  │     ├─ chaincode
│  │     │  └─ contract.go
│  │     └─ go.mod
│  └─ token-erc-20
│     ├─ README.md
│     ├─ chaincode-java
│     │  ├─ gradlew
│     │  ├─ settings.gradle
│     │  ├─ src
│     │  │  ├─ test
│     │  │  │  ├─ resources
│     │  │  │  │  └─ mockito-extensions
│     │  │  │  │     └─ org.mockito.plugins.MockMaker
│     │  │  │  └─ java
│     │  │  │     └─ org
│     │  │  │        └─ hyperledger
│     │  │  │           └─ fabric
│     │  │  │              └─ samples
│     │  │  │                 └─ erc20
│     │  │  │                    └─ TokenERC20ContractTest.java
│     │  │  └─ main
│     │  │     └─ java
│     │  │        └─ org
│     │  │           └─ hyperledger
│     │  │              └─ fabric
│     │  │                 └─ samples
│     │  │                    └─ erc20
│     │  │                       ├─ model
│     │  │                       │  ├─ Transfer.java
│     │  │                       │  └─ Approval.java
│     │  │                       ├─ utils
│     │  │                       │  └─ ContractUtility.java
│     │  │                       ├─ ERC20TokenContract.java
│     │  │                       ├─ ContractConstants.java
│     │  │                       └─ ContractErrors.java
│     │  ├─ gradle
│     │  │  └─ wrapper
│     │  │     ├─ gradle-wrapper.properties
│     │  │     └─ gradle-wrapper.jar
│     │  ├─ build.gradle
│     │  ├─ docker
│     │  │  └─ docker-entrypoint.sh
│     │  ├─ Dockerfile
│     │  ├─ gradlew.bat
│     │  └─ config
│     │     └─ checkstyle
│     │        ├─ suppressions.xml
│     │        └─ checkstyle.xml
│     ├─ chaincode-javascript
│     │  ├─ test
│     │  │  └─ tokenERC20.test.js
│     │  ├─ package.json
│     │  ├─ .eslintrc.js
│     │  ├─ npm-shrinkwrap.json
│     │  ├─ index.js
│     │  ├─ .editorconfig
│     │  ├─ lib
│     │  │  └─ tokenERC20.js
│     │  └─ .eslintignore
│     └─ chaincode-go
│        ├─ go.sum
│        ├─ chaincode
│        │  └─ token_contract.go
│        ├─ go.mod
│        └─ token_erc_20.go
├─ README.md
├─ server-node-sdk
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ invoke.js
│  ├─ helper.js
│  ├─ cert-script
│  │  ├─ onboardInsuranceAgent.js
│  │  ├─ onboardInsuranceCompany.js
│  │  ├─ registerOrg2Admin.js
│  │  ├─ callChaincode.js
│  │  ├─ onboardHospital01.js
│  │  ├─ registerOrg1Admin.js
│  │  └─ onboardDoctor.js
│  ├─ query.js
│  ├─ wallet
│  │  ├─ patient-001.id
│  │  ├─ insuranceAgent-Rama.id
│  │  ├─ anuj.id
│  │  ├─ Doctor-Rama04.id
│  │  ├─ hospitalAdmin.id
│  │  ├─ insuranceAdmin.id
│  │  ├─ Hospital01.id
│  │  └─ insuranceCompany01.id
│  └─ app.js
├─ LICENSE
└─ install-fabric.sh

```
```
EHR-Hyperledger-Fabric-Project
├─ backup
│  ├─ invokeByInvestor.js
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ registerAdmin.js
│  ├─ invoke.js
│  ├─ registerUser.js
│  ├─ helper.js
│  ├─ query.js
│  └─ app.js
├─ fabric-explorer
│  ├─ connection-profile
│  │  └─ test-network.json
│  ├─ config.json
│  └─ docker-compose.yaml
├─ EHR-APIs.postman_collection.json
├─ fabric-samples
│  ├─ CODEOWNERS
│  ├─ asset-transfer-ledger-queries
│  │  ├─ application-javascript
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ .eslintignore
│  │  │  └─ app.js
│  │  ├─ application-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  └─ main
│  │  │  │     ├─ resources
│  │  │  │     │  └─ log4j.properties
│  │  │  │     └─ java
│  │  │  │        └─ application
│  │  │  │           └─ java
│  │  │  │              ├─ EnrollAdmin.java
│  │  │  │              ├─ RegisterUser.java
│  │  │  │              └─ App.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  └─ gradlew.bat
│  │  ├─ chaincode-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ assetTransferLedger.ts
│  │  │  │  ├─ asset.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ tsconfig.json
│  │  │  └─ META-INF
│  │  │     └─ statedb
│  │  │        └─ couchdb
│  │  │           └─ indexes
│  │  │              └─ indexOwner.json
│  │  ├─ chaincode-javascript
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ index.js
│  │  │  ├─ lib
│  │  │  │  └─ asset_transfer_ledger_chaincode.js
│  │  │  ├─ .eslintignore
│  │  │  └─ META-INF
│  │  │     └─ statedb
│  │  │        └─ couchdb
│  │  │           └─ indexes
│  │  │              └─ indexOwner.json
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ asset_transfer_ledger_chaincode.go
│  │     ├─ go.mod
│  │     └─ META-INF
│  │        └─ statedb
│  │           └─ couchdb
│  │              └─ indexes
│  │                 └─ indexOwner.json
│  ├─ asset-transfer-sbe
│  │  ├─ README.md
│  │  ├─ application-javascript
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ .eslintignore
│  │  │  └─ app.js
│  │  ├─ chaincode-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ assetContract.ts
│  │  │  │  ├─ asset.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  └─ tsconfig.json
│  │  └─ chaincode-java
│  │     ├─ gradlew
│  │     ├─ settings.gradle
│  │     ├─ src
│  │     │  └─ main
│  │     │     └─ java
│  │     │        └─ org
│  │     │           └─ hyperledger
│  │     │              └─ fabric
│  │     │                 └─ samples
│  │     │                    └─ sbe
│  │     │                       ├─ AssetContract.java
│  │     │                       └─ Asset.java
│  │     ├─ gradle
│  │     │  └─ wrapper
│  │     │     ├─ gradle-wrapper.properties
│  │     │     └─ gradle-wrapper.jar
│  │     ├─ build.gradle
│  │     ├─ gradlew.bat
│  │     └─ config
│  │        └─ checkstyle
│  │           ├─ suppressions.xml
│  │           └─ checkstyle.xml
│  ├─ bin
│  │  ├─ cryptogen
│  │  ├─ osnadmin
│  │  ├─ fabric-ca-server
│  │  ├─ peer
│  │  ├─ discover
│  │  ├─ fabric-ca-client
│  │  ├─ orderer
│  │  ├─ ledgerutil
│  │  ├─ configtxlator
│  │  └─ configtxgen
│  ├─ MAINTAINERS.md
│  ├─ test-application
│  │  └─ javascript
│  │     ├─ CAUtil.js
│  │     └─ AppUtil.js
│  ├─ asset-transfer-abac
│  │  ├─ README.md
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ smart-contract
│  │     │  └─ abac.go
│  │     ├─ go.mod
│  │     └─ smartContract.go
│  ├─ test-network
│  │  ├─ addOrg3
│  │  │  ├─ ccp-template.yaml
│  │  │  ├─ README.md
│  │  │  ├─ org3-crypto.yaml
│  │  │  ├─ configtx.yaml
│  │  │  ├─ ccp-template.json
│  │  │  ├─ compose
│  │  │  │  ├─ compose-ca-org3.yaml
│  │  │  │  ├─ compose-org3.yaml
│  │  │  │  ├─ podman
│  │  │  │  │  ├─ podman-compose-ca-org3.yaml
│  │  │  │  │  ├─ podman-compose-org3.yaml
│  │  │  │  │  ├─ peercfg
│  │  │  │  │  │  └─ core.yaml
│  │  │  │  │  └─ podman-compose-couch-org3.yaml
│  │  │  │  ├─ compose-couch-org3.yaml
│  │  │  │  └─ docker
│  │  │  │     ├─ docker-compose-org3.yaml
│  │  │  │     ├─ docker-compose-couch-org3.yaml
│  │  │  │     ├─ peercfg
│  │  │  │     │  └─ core.yaml
│  │  │  │     └─ docker-compose-ca-org3.yaml
│  │  │  ├─ fabric-ca
│  │  │  │  ├─ registerEnroll.sh
│  │  │  │  └─ org3
│  │  │  │     └─ fabric-ca-server-config.yaml
│  │  │  ├─ addOrg3.sh
│  │  │  └─ ccp-generate.sh
│  │  ├─ bft-config
│  │  │  └─ configtx.yaml
│  │  ├─ setOrgEnv.sh
│  │  ├─ prometheus-grafana
│  │  │  ├─ grafana_db
│  │  │  │  └─ grafana.db
│  │  │  ├─ README.md
│  │  │  ├─ grafana
│  │  │  │  ├─ provisioning
│  │  │  │  │  ├─ dashboards
│  │  │  │  │  │  ├─ dashboard.yml
│  │  │  │  │  │  └─ hlf-performances.json
│  │  │  │  │  └─ datasources
│  │  │  │  │     └─ datasource.yml
│  │  │  │  └─ config.monitoring
│  │  │  ├─ prometheus
│  │  │  │  └─ prometheus.yml
│  │  │  └─ docker-compose.yaml
│  │  ├─ README.md
│  │  ├─ configtx
│  │  │  └─ configtx.yaml
│  │  ├─ organizations
│  │  │  ├─ ccp-template.yaml
│  │  │  ├─ cryptogen
│  │  │  │  ├─ crypto-config-org2.yaml
│  │  │  │  ├─ crypto-config-org1.yaml
│  │  │  │  └─ crypto-config-orderer.yaml
│  │  │  ├─ ccp-template.json
│  │  │  ├─ fabric-ca
│  │  │  │  ├─ org2
│  │  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  │  ├─ registerEnroll.sh
│  │  │  │  ├─ ordererOrg
│  │  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  │  └─ org1
│  │  │  │     └─ fabric-ca-server-config.yaml
│  │  │  ├─ cfssl
│  │  │  │  ├─ ca-peer.json
│  │  │  │  ├─ registerEnroll.sh
│  │  │  │  ├─ peer-csr-template.json
│  │  │  │  ├─ admin-csr-template.json
│  │  │  │  ├─ ca-orderer.json
│  │  │  │  ├─ orderer-csr-template.json
│  │  │  │  ├─ cert-signing-config.json
│  │  │  │  └─ client-csr-template.json
│  │  │  └─ ccp-generate.sh
│  │  ├─ network.sh
│  │  ├─ system-genesis-block
│  │  ├─ compose
│  │  │  ├─ podman
│  │  │  │  ├─ podman-compose-test-net.yaml
│  │  │  │  └─ peercfg
│  │  │  │     └─ core.yaml
│  │  │  ├─ compose-ca.yaml
│  │  │  ├─ compose-couch.yaml
│  │  │  ├─ compose-bft-test-net.yaml
│  │  │  ├─ docker
│  │  │  │  ├─ docker-compose-test-net.yaml
│  │  │  │  ├─ docker-compose-bft-test-net.yaml
│  │  │  │  └─ peercfg
│  │  │  │     └─ core.yaml
│  │  │  └─ compose-test-net.yaml
│  │  ├─ network.config
│  │  ├─ scripts
│  │  │  ├─ configUpdate.sh
│  │  │  ├─ deployCC.sh
│  │  │  ├─ utils.sh
│  │  │  ├─ orderer.sh
│  │  │  ├─ orderer3.sh
│  │  │  ├─ ccutils.sh
│  │  │  ├─ createChannel.sh
│  │  │  ├─ packageCC.sh
│  │  │  ├─ add_new_orderer_to_config.py
│  │  │  ├─ setAnchorPeer.sh
│  │  │  ├─ org3-scripts
│  │  │  │  ├─ updateChannelConfig.sh
│  │  │  │  └─ joinChannel.sh
│  │  │  ├─ orderer2.sh
│  │  │  ├─ envVar.sh
│  │  │  ├─ deployCCAAS.sh
│  │  │  ├─ orderer4.sh
│  │  │  └─ pkgcc.sh
│  │  ├─ CHAINCODE_AS_A_SERVICE_TUTORIAL.md
│  │  └─ monitordocker.sh
│  ├─ README.md
│  ├─ CODE_OF_CONDUCT.md
│  ├─ test-network-nano-bash
│  │  ├─ configureExternalBuilders.sh
│  │  ├─ chaincode_interaction.sh
│  │  ├─ peer2admin.sh
│  │  ├─ bft-config
│  │  │  └─ configtx.yaml
│  │  ├─ external_builders
│  │  │  ├─ golang
│  │  │  │  └─ bin
│  │  │  │     ├─ detect
│  │  │  │     ├─ run
│  │  │  │     ├─ release
│  │  │  │     └─ build
│  │  │  ├─ core_yaml_change.yaml
│  │  │  └─ node
│  │  │     └─ bin
│  │  │        ├─ detect
│  │  │        ├─ run
│  │  │        ├─ release
│  │  │        └─ build
│  │  ├─ ordererca.sh
│  │  ├─ peer4.sh
│  │  ├─ peer2.sh
│  │  ├─ peer1admin.sh
│  │  ├─ README.md
│  │  ├─ install&approve&commit_chaincode_peer1.sh
│  │  ├─ orderer3.sh
│  │  ├─ network.sh
│  │  ├─ configtx.yaml
│  │  ├─ peer3admin.sh
│  │  ├─ join_orderers.sh
│  │  ├─ crypto-config.yaml
│  │  ├─ peer1.sh
│  │  ├─ orderer1.sh
│  │  ├─ org1ca.sh
│  │  ├─ orderer2.sh
│  │  ├─ peer3.sh
│  │  ├─ ca
│  │  │  ├─ ccp-template.yaml
│  │  │  ├─ ca_utils.sh
│  │  │  ├─ createEnrollments.sh
│  │  │  ├─ ccp-template.json
│  │  │  ├─ ca_config
│  │  │  │  ├─ tlsca
│  │  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  │  └─ ca
│  │  │  │     └─ fabric-ca-server-config.yaml
│  │  │  ├─ config.yaml
│  │  │  └─ ccp-generate.sh
│  │  ├─ generate_artifacts.sh
│  │  ├─ terminal_setup.png
│  │  ├─ join_channel.sh
│  │  ├─ peer4admin.sh
│  │  ├─ org2ca.sh
│  │  ├─ orderer4.sh
│  │  ├─ chaincode-external
│  │  │  ├─ connection.json
│  │  │  └─ metadata.json
│  │  └─ ca_terminal_setup.png
│  ├─ SECURITY.md
│  ├─ asset-transfer-events
│  │  ├─ application-gateway-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ app.ts
│  │  │  │  └─ connect.ts
│  │  │  └─ tsconfig.json
│  │  ├─ README.md
│  │  ├─ application-gateway-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ pom.xml
│  │  │  ├─ src
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        ├─ Connections.java
│  │  │  │        └─ App.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  └─ gradlew.bat
│  │  ├─ chaincode-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ org
│  │  │  │           └─ hyperledger
│  │  │  │              └─ fabric
│  │  │  │                 └─ samples
│  │  │  │                    └─ events
│  │  │  │                       ├─ Asset.java
│  │  │  │                       └─ AssetTransfer.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  ├─ gradlew.bat
│  │  │  └─ config
│  │  │     └─ checkstyle
│  │  │        ├─ suppressions.xml
│  │  │        └─ checkstyle.xml
│  │  ├─ application-gateway-go
│  │  │  ├─ app.go
│  │  │  ├─ go.sum
│  │  │  ├─ go.mod
│  │  │  └─ connect.go
│  │  ├─ chaincode-javascript
│  │  │  ├─ test
│  │  │  │  └─ assetTransferEvents.test.js
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ index.js
│  │  │  ├─ lib
│  │  │  │  └─ assetTransferEvents.js
│  │  │  └─ .eslintignore
│  │  └─ chaincode-go
│  │     ├─ assetTransferEvents.go
│  │     ├─ go.sum
│  │     ├─ chaincode
│  │     │  └─ smartcontract.go
│  │     └─ go.mod
│  ├─ auction-simple
│  │  ├─ README.md
│  │  ├─ application-javascript
│  │  │  ├─ queryBid.js
│  │  │  ├─ submitBid.js
│  │  │  ├─ package.json
│  │  │  ├─ closeAuction.js
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ registerEnrollUser.js
│  │  │  ├─ queryAuction.js
│  │  │  ├─ createAuction.js
│  │  │  ├─ bid.js
│  │  │  ├─ enrollAdmin.js
│  │  │  ├─ .eslintignore
│  │  │  ├─ revealBid.js
│  │  │  └─ endAuction.js
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ smart-contract
│  │     │  ├─ utils.go
│  │     │  ├─ auction.go
│  │     │  └─ auctionQueries.go
│  │     ├─ go.mod
│  │     └─ smartContract.go
│  ├─ off_chain_data
│  │  ├─ application-go
│  │  │  ├─ utils.go
│  │  │  ├─ parser
│  │  │  │  ├─ payload.go
│  │  │  │  ├─ readWriteSet.go
│  │  │  │  ├─ transaction.go
│  │  │  │  ├─ namespaceReadWriteSet.go
│  │  │  │  ├─ block_test.go
│  │  │  │  ├─ endorserTransaction.go
│  │  │  │  └─ block.go
│  │  │  ├─ app.go
│  │  │  ├─ go.sum
│  │  │  ├─ contract
│  │  │  │  ├─ model.go
│  │  │  │  └─ contract.go
│  │  │  ├─ transact.go
│  │  │  ├─ store.go
│  │  │  ├─ go.mod
│  │  │  ├─ connect.go
│  │  │  ├─ getAllAssets.go
│  │  │  └─ listen.go
│  │  ├─ README.md
│  │  ├─ application-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ listen.ts
│  │  │  │  ├─ expectedError.ts
│  │  │  │  ├─ transact.ts
│  │  │  │  ├─ getAllAssets.ts
│  │  │  │  ├─ contract.ts
│  │  │  │  ├─ app.ts
│  │  │  │  ├─ blockParser.ts
│  │  │  │  ├─ connect.ts
│  │  │  │  └─ utils.ts
│  │  │  └─ tsconfig.json
│  │  └─ application-java
│  │     ├─ gradlew
│  │     ├─ settings.gradle
│  │     ├─ app
│  │     │  ├─ pom.xml
│  │     │  ├─ src
│  │     │  │  └─ main
│  │     │  │     └─ java
│  │     │  │        ├─ BlockProcessor.java
│  │     │  │        ├─ parser
│  │     │  │        │  ├─ ParsedPayload.java
│  │     │  │        │  ├─ ParsedBlock.java
│  │     │  │        │  ├─ ParsedTransaction.java
│  │     │  │        │  ├─ BlockParser.java
│  │     │  │        │  ├─ ParsedReadWriteSet.java
│  │     │  │        │  ├─ NamespaceReadWriteSet.java
│  │     │  │        │  ├─ Transaction.java
│  │     │  │        │  ├─ Utils.java
│  │     │  │        │  ├─ Block.java
│  │     │  │        │  └─ ParsedTransactionAction.java
│  │     │  │        ├─ Write.java
│  │     │  │        ├─ Command.java
│  │     │  │        ├─ Store.java
│  │     │  │        ├─ TransactionProcessor.java
│  │     │  │        ├─ Utils.java
│  │     │  │        ├─ Asset.java
│  │     │  │        ├─ TransactApp.java
│  │     │  │        ├─ AssetTransferBasic.java
│  │     │  │        ├─ GetAllAssets.java
│  │     │  │        ├─ Listen.java
│  │     │  │        ├─ ExpectedException.java
│  │     │  │        ├─ Transact.java
│  │     │  │        ├─ Connections.java
│  │     │  │        └─ App.java
│  │     │  └─ build.gradle
│  │     ├─ gradle
│  │     │  └─ wrapper
│  │     │     ├─ gradle-wrapper.properties
│  │     │     └─ gradle-wrapper.jar
│  │     ├─ gradlew.bat
│  │     └─ config
│  │        └─ checkstyle
│  │           ├─ java-copyright-header.txt
│  │           └─ checkstyle.xml
│  ├─ asset-transfer-private-data
│  │  ├─ application-gateway-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ app.ts
│  │  │  │  └─ connect.ts
│  │  │  ├─ README.md
│  │  │  └─ tsconfig.json
│  │  ├─ README.md
│  │  ├─ chaincode-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ Readme.md
│  │  │  ├─ src
│  │  │  │  ├─ transferAgreement.ts
│  │  │  │  ├─ assetTransfer.ts
│  │  │  │  ├─ assetTransferDetails.ts
│  │  │  │  ├─ assetTransferTransientInput.ts
│  │  │  │  ├─ asset.ts
│  │  │  │  ├─ index.ts
│  │  │  │  └─ utils.ts
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ .dockerignore
│  │  │  ├─ docker
│  │  │  │  └─ docker-entrypoint.sh
│  │  │  ├─ Dockerfile
│  │  │  ├─ tsconfig.json
│  │  │  └─ collections_config.json
│  │  ├─ chaincode-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  ├─ test
│  │  │  │  │  ├─ resources
│  │  │  │  │  │  └─ mockito-extensions
│  │  │  │  │  │     └─ org.mockito.plugins.MockMaker
│  │  │  │  │  └─ java
│  │  │  │  │     └─ org
│  │  │  │  │        └─ hyperledger
│  │  │  │  │           └─ fabric
│  │  │  │  │              └─ samples
│  │  │  │  │                 └─ privatedata
│  │  │  │  │                    └─ AssetTransferTest.java
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ org
│  │  │  │           └─ hyperledger
│  │  │  │              └─ fabric
│  │  │  │                 └─ samples
│  │  │  │                    └─ privatedata
│  │  │  │                       ├─ TransferAgreement.java
│  │  │  │                       ├─ AssetPrivateDetails.java
│  │  │  │                       ├─ Asset.java
│  │  │  │                       └─ AssetTransfer.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  ├─ gradlew.bat
│  │  │  ├─ config
│  │  │  │  └─ checkstyle
│  │  │  │     ├─ suppressions.xml
│  │  │  │     └─ checkstyle.xml
│  │  │  ├─ META-INF
│  │  │  │  └─ statedb
│  │  │  │     └─ couchdb
│  │  │  │        └─ collections
│  │  │  │           └─ assetCollection
│  │  │  │              └─ indexes
│  │  │  │                 └─ indexOwner.json
│  │  │  └─ collections_config.json
│  │  ├─ application-gateway-go
│  │  │  ├─ app.go
│  │  │  ├─ go.sum
│  │  │  ├─ go.mod
│  │  │  └─ connect.go
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ README.md
│  │     ├─ chaincode
│  │     │  ├─ mocks
│  │     │  │  ├─ statequeryiterator.go
│  │     │  │  ├─ transaction.go
│  │     │  │  ├─ clientIdentity.go
│  │     │  │  └─ chaincodestub.go
│  │     │  ├─ asset_transfer_test.go
│  │     │  ├─ asset_transfer.go
│  │     │  ├─ asset_queries_test.go
│  │     │  └─ asset_queries.go
│  │     ├─ go.mod
│  │     ├─ main.go
│  │     ├─ META-INF
│  │     │  └─ statedb
│  │     │     └─ couchdb
│  │     │        └─ collections
│  │     │           └─ assetCollection
│  │     │              └─ indexes
│  │     │                 └─ indexOwner.json
│  │     └─ collections_config.json
│  ├─ test-network-k8s
│  │  ├─ docs
│  │  │  ├─ CA.md
│  │  │  ├─ KUBERNETES.md
│  │  │  ├─ APPLICATIONS.md
│  │  │  ├─ images
│  │  │  │  └─ test-network.png
│  │  │  ├─ CHAINCODE_AS_A_SERVICE.md
│  │  │  ├─ README.md
│  │  │  ├─ CALIPER.md
│  │  │  ├─ CHAINCODE.md
│  │  │  ├─ TEST_NETWORK.md
│  │  │  ├─ BFT_ORDERERS.md
│  │  │  ├─ CHANNELS.md
│  │  │  └─ HIGH_AVAILABILITY.md
│  │  ├─ README.md
│  │  ├─ kube
│  │  │  ├─ org2
│  │  │  │  ├─ org2-peer1.yaml
│  │  │  │  ├─ org2-ca.yaml
│  │  │  │  ├─ org2-cc-template.yaml
│  │  │  │  ├─ org2-install-k8s-builder.yaml
│  │  │  │  ├─ org2-job-scrub-fabric-volumes.yaml
│  │  │  │  ├─ org2-peer2.yaml
│  │  │  │  └─ org2-tls-cert-issuer.yaml
│  │  │  ├─ ns-test-network.yaml
│  │  │  ├─ application-deployment.yaml
│  │  │  ├─ pvc-fabric-org1.yaml
│  │  │  ├─ pvc-fabric-org2.yaml
│  │  │  ├─ root-tls-cert-issuer.yaml
│  │  │  ├─ ingress-nginx-k3s.yaml
│  │  │  ├─ fabric-builder-role.yaml
│  │  │  ├─ pvc-fabric-org0.yaml
│  │  │  ├─ fabric-builder-rolebinding.yaml
│  │  │  ├─ org0
│  │  │  │  ├─ org0-tls-cert-issuer.yaml
│  │  │  │  ├─ org0-job-scrub-fabric-volumes.yaml
│  │  │  │  ├─ org0-orderer1.yaml
│  │  │  │  ├─ org0-orderer3.yaml
│  │  │  │  ├─ org0-orderer2.yaml
│  │  │  │  ├─ org0-orderer4.yaml
│  │  │  │  └─ org0-ca.yaml
│  │  │  ├─ org1
│  │  │  │  ├─ org1-ca.yaml
│  │  │  │  ├─ org1-peer1.yaml
│  │  │  │  ├─ org1-peer2.yaml
│  │  │  │  ├─ org1-job-scrub-fabric-volumes.yaml
│  │  │  │  ├─ org1-cc-template.yaml
│  │  │  │  ├─ org1-tls-cert-issuer.yaml
│  │  │  │  └─ org1-install-k8s-builder.yaml
│  │  │  ├─ fabric-rest-sample.yaml
│  │  │  └─ ingress-nginx-kind.yaml
│  │  ├─ scripts
│  │  │  ├─ rest_sample.sh
│  │  │  ├─ utils.sh
│  │  │  ├─ chaincode.sh
│  │  │  ├─ cluster.sh
│  │  │  ├─ set_anchor_peer.sh
│  │  │  ├─ ccp-template.json
│  │  │  ├─ fabric_config.sh
│  │  │  ├─ prereqs.sh
│  │  │  ├─ fabric_CAs.sh
│  │  │  ├─ test_network.sh
│  │  │  ├─ application_connection.sh
│  │  │  ├─ kind.sh
│  │  │  └─ channel.sh
│  │  ├─ config
│  │  │  ├─ org2
│  │  │  │  ├─ core.yaml
│  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  ├─ org0
│  │  │  │  ├─ configtx-template.yaml
│  │  │  │  ├─ bft
│  │  │  │  │  └─ configtx-template.yaml
│  │  │  │  └─ fabric-ca-server-config.yaml
│  │  │  └─ org1
│  │  │     ├─ core.yaml
│  │  │     └─ fabric-ca-server-config.yaml
│  │  └─ network
│  ├─ builders
│  │  └─ ccaas
│  │     └─ bin
│  │        ├─ detect
│  │        ├─ release
│  │        └─ build
│  ├─ ci
│  │  └─ scripts
│  │     ├─ run-test-network-off-chain.sh
│  │     ├─ lint-java.sh
│  │     ├─ lint-shell.sh
│  │     ├─ run-test-network-private.sh
│  │     ├─ run-test-network-events.sh
│  │     ├─ lint-typescript.sh
│  │     ├─ run-test-network-ledger.sh
│  │     ├─ run-test-network-basic.sh
│  │     ├─ run-test-network-sbe.sh
│  │     ├─ run-test-network-secured.sh
│  │     ├─ lint.sh
│  │     ├─ run-k8s-test-network-basic.sh
│  │     ├─ lint-javascript.sh
│  │     ├─ lint-go.sh
│  │     └─ run-test-network-hsm.sh
│  ├─ CONTRIBUTING.md
│  ├─ .editorconfig
│  ├─ CHANGELOG.md
│  ├─ token-erc-721
│  │  ├─ README.md
│  │  ├─ chaincode-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  ├─ test
│  │  │  │  │  ├─ resources
│  │  │  │  │  │  └─ mockito-extensions
│  │  │  │  │  │     └─ org.mockito.plugins.MockMaker
│  │  │  │  │  └─ java
│  │  │  │  │     └─ org
│  │  │  │  │        └─ hyperledger
│  │  │  │  │           └─ fabric
│  │  │  │  │              └─ samples
│  │  │  │  │                 └─ erc721
│  │  │  │  │                    └─ ERC721TokenContractTest.java
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ org
│  │  │  │           └─ hyperledger
│  │  │  │              └─ fabric
│  │  │  │                 └─ samples
│  │  │  │                    └─ erc721
│  │  │  │                       ├─ utils
│  │  │  │                       │  └─ ContractUtility.java
│  │  │  │                       ├─ ERC721TokenContract.java
│  │  │  │                       ├─ models
│  │  │  │                       │  ├─ NFT.java
│  │  │  │                       │  ├─ Transfer.java
│  │  │  │                       │  └─ Approval.java
│  │  │  │                       ├─ ContractConstants.java
│  │  │  │                       └─ ContractErrors.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  ├─ docker
│  │  │  │  └─ docker-entrypoint.sh
│  │  │  ├─ Dockerfile
│  │  │  ├─ gradlew.bat
│  │  │  └─ config
│  │  │     └─ checkstyle
│  │  │        ├─ suppressions.xml
│  │  │        └─ checkstyle.xml
│  │  ├─ chaincode-javascript
│  │  │  ├─ test
│  │  │  │  └─ tokenERC721.test.js
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ index.js
│  │  │  ├─ .editorconfig
│  │  │  ├─ lib
│  │  │  │  └─ tokenERC721.js
│  │  │  └─ .eslintignore
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ chaincode
│  │     │  ├─ erc721-contract.go
│  │     │  ├─ erc721-contract_test.go
│  │     │  └─ erc721.go
│  │     ├─ go.mod
│  │     └─ main.go
│  ├─ token-utxo
│  │  ├─ README.md
│  │  └─ chaincode-go
│  │     ├─ token_utxo.go
│  │     ├─ go.sum
│  │     ├─ chaincode
│  │     │  └─ token_contract.go
│  │     └─ go.mod
│  ├─ full-stack-asset-transfer-guide
│  │  ├─ SETUP.md
│  │  ├─ docs
│  │  │  ├─ images
│  │  │  │  ├─ ApplicationDev.pptx
│  │  │  │  ├─ cloud-vm-with-operator-network.png
│  │  │  │  ├─ multipass-test-network.png
│  │  │  │  ├─ readme_diagram.png
│  │  │  │  ├─ multipass-operator-network.png
│  │  │  │  ├─ CloudReady.pptx
│  │  │  │  ├─ ApplicationDev
│  │  │  │  │  ├─ fabric-gateway-model.png
│  │  │  │  │  ├─ fabric-gateway-deployment.png
│  │  │  │  │  ├─ legacy-sdk-model.png
│  │  │  │  │  └─ transaction-submit-flow.png
│  │  │  │  └─ CloudReady
│  │  │  │     ├─ 12-kube-ec2-vm.png
│  │  │  │     ├─ 20-fabric.png
│  │  │  │     ├─ 40-gateway-client-app.png
│  │  │  │     ├─ kube-ec2-vm.png
│  │  │  │     ├─ 30-chaincode.png
│  │  │  │     ├─ 10-kube.png
│  │  │  │     └─ 00-cloud-ready-2.png
│  │  │  ├─ tips-for-windows-dev.md
│  │  │  ├─ SmartContractDev
│  │  │  │  ├─ 03-Test-And-Debug-Reference-ES.md
│  │  │  │  ├─ 00-Introduction-ES.md
│  │  │  │  ├─ 01-Exercise-Getting-Started-ES.md
│  │  │  │  ├─ 02-Exercise-Adding-tx-function.md
│  │  │  │  ├─ 01-Exercise-Getting-Started.md
│  │  │  │  ├─ 02-Exercise-Adding-tx-function-ES.md
│  │  │  │  ├─ 00-Introduction.md
│  │  │  │  └─ 03-Test-And-Debug-Reference.md
│  │  │  ├─ ApplicationDev
│  │  │  │  ├─ 01-FabricGateway.md
│  │  │  │  ├─ 01-FabricGateway-ES.md
│  │  │  │  ├─ 04-Exercise-AssetTransfer-ES.md
│  │  │  │  ├─ 04-Exercise-AssetTransfer.md
│  │  │  │  ├─ README.md
│  │  │  │  ├─ 06-Exercise-ChaincodeEvents.md
│  │  │  │  ├─ 03-ApplicationOverview-ES.md
│  │  │  │  ├─ 05-ChaincodeEvents-ES.md
│  │  │  │  ├─ 06-Exercise-ChaincodeEvents-ES.md
│  │  │  │  ├─ 05-ChaincodeEvents.md
│  │  │  │  ├─ 02-Exercise-RunApplication.md
│  │  │  │  ├─ 03-ApplicationOverview.md
│  │  │  │  └─ 02-Exercise-RunApplication-ES.md
│  │  │  └─ CloudReady
│  │  │     ├─ 31-fabric-ansible-chaincode.md
│  │  │     ├─ 10-kube-zh.md
│  │  │     ├─ 20-fabric.md
│  │  │     ├─ README.md
│  │  │     ├─ 21-fabric-operations-console.md
│  │  │     ├─ 00-setup-zh.md
│  │  │     ├─ 00-setup.md
│  │  │     ├─ 50-OpenShift-Deployment.md
│  │  │     ├─ 90-teardown.md
│  │  │     ├─ 20-fabric-zh.md
│  │  │     ├─ 40-bananas-zh.md
│  │  │     ├─ 40-bananas.md
│  │  │     ├─ 12-kube-ec2-vm.md
│  │  │     ├─ 11-kube-multipass.md
│  │  │     ├─ 13-kube-public-cloud.md
│  │  │     ├─ 30-chaincode.md
│  │  │     ├─ 10-kube.md
│  │  │     ├─ 22-fabric-ansible-collection.md
│  │  │     └─ 30-chaincode-zh.md
│  │  ├─ contracts
│  │  │  └─ asset-transfer-typescript
│  │  │     ├─ eslint.config.mjs
│  │  │     ├─ package.json
│  │  │     ├─ asset-transfer-chaincode-vars.yml
│  │  │     ├─ src
│  │  │     │  ├─ assetTransfer.ts
│  │  │     │  ├─ untyped.d.ts
│  │  │     │  ├─ asset.ts
│  │  │     │  └─ index.ts
│  │  │     ├─ npm-shrinkwrap.json
│  │  │     ├─ docker
│  │  │     │  └─ docker-entrypoint.sh
│  │  │     ├─ Dockerfile
│  │  │     └─ tsconfig.json
│  │  ├─ README.md
│  │  ├─ check.sh
│  │  ├─ checks
│  │  │  ├─ check-kube.sh
│  │  │  ├─ utils.sh
│  │  │  ├─ check-network.sh
│  │  │  └─ check-chaincode.sh
│  │  ├─ justfile
│  │  ├─ tests
│  │  │  ├─ 10-appdev-e2e.sh
│  │  │  ├─ 30-ansible-e2e.sh
│  │  │  ├─ 20-cloud-e2e.sh
│  │  │  ├─ 00-chaincode-e2e.sh
│  │  │  └─ 40-console.sh
│  │  ├─ applications
│  │  │  ├─ frontend
│  │  │  │  ├─ screenshots
│  │  │  │  │  ├─ list.png
│  │  │  │  │  └─ Create.png
│  │  │  │  ├─ .browserslistrc
│  │  │  │  ├─ package.json
│  │  │  │  ├─ src
│  │  │  │  │  ├─ favicon.ico
│  │  │  │  │  ├─ styles.scss
│  │  │  │  │  ├─ assets
│  │  │  │  │  ├─ polyfills.ts
│  │  │  │  │  ├─ app
│  │  │  │  │  │  ├─ app.component.ts
│  │  │  │  │  │  ├─ app.component.html
│  │  │  │  │  │  ├─ app.component.spec.ts
│  │  │  │  │  │  ├─ asset-dialog
│  │  │  │  │  │  │  ├─ asset-dialog.component.ts
│  │  │  │  │  │  │  ├─ asset-dialog.component.scss
│  │  │  │  │  │  │  ├─ asset-dialog.component.html
│  │  │  │  │  │  │  └─ asset-dialog.component.spec.ts
│  │  │  │  │  │  ├─ app.module.ts
│  │  │  │  │  │  ├─ urls.ts
│  │  │  │  │  │  └─ app.component.scss
│  │  │  │  │  ├─ index.html
│  │  │  │  │  ├─ main.ts
│  │  │  │  │  ├─ test.ts
│  │  │  │  │  └─ environments
│  │  │  │  │     ├─ environment.prod.ts
│  │  │  │  │     └─ environment.ts
│  │  │  │  ├─ README.md
│  │  │  │  ├─ karma.conf.js
│  │  │  │  ├─ tsconfig.app.json
│  │  │  │  ├─ .editorconfig
│  │  │  │  ├─ tsconfig.spec.json
│  │  │  │  ├─ angular.json
│  │  │  │  ├─ Dockerfile
│  │  │  │  └─ tsconfig.json
│  │  │  ├─ ping-chaincode
│  │  │  │  ├─ package.json
│  │  │  │  ├─ src
│  │  │  │  │  ├─ jsonid-adapter.ts
│  │  │  │  │  ├─ fabric-connection-profile.ts
│  │  │  │  │  └─ app.ts
│  │  │  │  └─ tsconfig.json
│  │  │  ├─ rest-api
│  │  │  │  ├─ package.json
│  │  │  │  ├─ src
│  │  │  │  │  ├─ server.ts
│  │  │  │  │  ├─ connection.ts
│  │  │  │  │  └─ app.ts
│  │  │  │  ├─ deployment.yaml
│  │  │  │  ├─ README.md
│  │  │  │  ├─ renovate.json
│  │  │  │  ├─ asset-transfer.postman_collection.json
│  │  │  │  ├─ Dockerfile
│  │  │  │  ├─ LICENSE
│  │  │  │  └─ tsconfig.json
│  │  │  ├─ conga-cards
│  │  │  │  ├─ package.json
│  │  │  │  ├─ images
│  │  │  │  │  └─ interaction.png
│  │  │  │  ├─ assets
│  │  │  │  │  ├─ bananomatopoeia.png
│  │  │  │  │  ├─ blockbert.png
│  │  │  │  │  ├─ template.png
│  │  │  │  │  ├─ darth-conga.png
│  │  │  │  │  ├─ no-pun-intended.png
│  │  │  │  │  ├─ count-blockula.png
│  │  │  │  │  ├─ block-norris.png
│  │  │  │  │  └─ appleplectic.png
│  │  │  │  ├─ src
│  │  │  │  │  ├─ expectedError.ts
│  │  │  │  │  ├─ contract.ts
│  │  │  │  │  ├─ config.ts
│  │  │  │  │  ├─ app.ts
│  │  │  │  │  ├─ commands
│  │  │  │  │  │  ├─ create.ts
│  │  │  │  │  │  ├─ getAllAssets.ts
│  │  │  │  │  │  ├─ delete.ts
│  │  │  │  │  │  ├─ discord.ts
│  │  │  │  │  │  ├─ transfer.ts
│  │  │  │  │  │  ├─ index.ts
│  │  │  │  │  │  └─ read.ts
│  │  │  │  │  ├─ connect.ts
│  │  │  │  │  └─ utils.ts
│  │  │  │  ├─ README.md
│  │  │  │  ├─ .eslintrc.js
│  │  │  │  ├─ hooks
│  │  │  │  │  └─ captain-hook.json
│  │  │  │  └─ tsconfig.json
│  │  │  └─ trader-typescript
│  │  │     ├─ eslint.config.mjs
│  │  │     ├─ package.json
│  │  │     ├─ src
│  │  │     │  ├─ expectedError.ts
│  │  │     │  ├─ contract.ts
│  │  │     │  ├─ config.ts
│  │  │     │  ├─ app.ts
│  │  │     │  ├─ commands
│  │  │     │  │  ├─ create.ts
│  │  │     │  │  ├─ listen.ts
│  │  │     │  │  ├─ transact.ts
│  │  │     │  │  ├─ getAllAssets.ts
│  │  │     │  │  ├─ delete.ts
│  │  │     │  │  ├─ transfer.ts
│  │  │     │  │  ├─ index.ts
│  │  │     │  │  └─ read.ts
│  │  │     │  ├─ connect.ts
│  │  │     │  └─ utils.ts
│  │  │     ├─ README.md
│  │  │     └─ tsconfig.json
│  │  ├─ LICENSE
│  │  └─ infrastructure
│  │     ├─ multipass-cloud-config.yaml
│  │     ├─ configuration
│  │     │  ├─ fabric-org2-vars.yml
│  │     │  ├─ fabric-ordering-org-vars.yml
│  │     │  ├─ operator-console-vars.yml
│  │     │  ├─ fabric-sail.yaml
│  │     │  ├─ fabric-org1-vars.yml
│  │     │  └─ fabric-common-vars.yml
│  │     ├─ production_chaincode_playbooks
│  │     │  ├─ 22-register-application.yml
│  │     │  ├─ 20-install-and-approve-chaincode.yml
│  │     │  ├─ 19-install-and-approve-chaincode.yml
│  │     │  ├─ asset-transfer_appid.json
│  │     │  └─ 21-commit-chaincode.yml
│  │     ├─ kind_with_nginx.sh
│  │     ├─ operator_console_playbooks
│  │     │  ├─ 02-console-install.yml
│  │     │  └─ 01-operator-install.yml
│  │     ├─ kind_console_ingress
│  │     │  ├─ templates
│  │     │  │  ├─ ingress
│  │     │  │  │  ├─ ingress-nginx-controller.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  └─ coredns
│  │     │  │     └─ coredns.yaml.j2
│  │     │  └─ 90-KIND-ingress.yml
│  │     ├─ setup_storage_classes.sh
│  │     ├─ ec2-cloud-config.yaml
│  │     ├─ sample-network
│  │     │  ├─ scripts
│  │     │  │  ├─ rest_sample.sh
│  │     │  │  ├─ utils.sh
│  │     │  │  ├─ frontend_build.sh
│  │     │  │  ├─ frontend_deployment.yaml
│  │     │  │  ├─ console.sh
│  │     │  │  ├─ prereqs.sh
│  │     │  │  ├─ sample_network.sh
│  │     │  │  ├─ channel.sh
│  │     │  │  └─ rest_deployment.yaml
│  │     │  ├─ config
│  │     │  │  ├─ orderers
│  │     │  │  │  ├─ org0-orderers.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  ├─ gateway
│  │     │  │  │  ├─ org1-peer-gateway.yaml
│  │     │  │  │  ├─ org2-peer-gateway.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  ├─ cas
│  │     │  │  │  ├─ org1-ca.yaml
│  │     │  │  │  ├─ org2-ca.yaml
│  │     │  │  │  ├─ kustomization.yaml
│  │     │  │  │  └─ org0-ca.yaml
│  │     │  │  ├─ configtx-template.yaml
│  │     │  │  ├─ peers
│  │     │  │  │  ├─ org2-peer1.yaml
│  │     │  │  │  ├─ org1-peer1.yaml
│  │     │  │  │  ├─ org1-peer2.yaml
│  │     │  │  │  ├─ org2-peer2.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  ├─ console
│  │     │  │  │  ├─ kustomization.yaml
│  │     │  │  │  └─ hlf-operations-console.yaml
│  │     │  │  ├─ rbac
│  │     │  │  │  ├─ fabric-operator-clusterrolebinding.yaml
│  │     │  │  │  ├─ fabric-operator-serviceaccount.yaml
│  │     │  │  │  ├─ fabric-operator-clusterrole.yaml
│  │     │  │  │  └─ kustomization.yaml
│  │     │  │  ├─ core.yaml
│  │     │  │  └─ manager
│  │     │  │     ├─ fabric-operator-manager.yaml
│  │     │  │     └─ kustomization.yaml
│  │     │  └─ network
│  │     ├─ fabric_network_playbooks
│  │     │  ├─ 02-create-endorsing-organization-components.yml
│  │     │  ├─ 15-lifecycle-endorsement-policy.json.j2
│  │     │  ├─ 17-join-peer-to-channel.yml
│  │     │  ├─ 09-admins-policy.json.j2
│  │     │  ├─ 15-add-organization-to-channel.yml
│  │     │  ├─ 11-add-anchor-peer-to-channel.yml
│  │     │  ├─ 09-writers-policy.json.j2
│  │     │  ├─ 09-readers-policy.json.j2
│  │     │  ├─ 16-import-ordering-service.yml
│  │     │  ├─ 09-create-channel.yml
│  │     │  ├─ 09-endorsement-policy.json.j2
│  │     │  ├─ 15-admins-policy.json.j2
│  │     │  ├─ 18-add-anchor-peer-to-channel.yml
│  │     │  ├─ 05-enable-capabilities.yml
│  │     │  ├─ 15-endorsement-policy.json.j2
│  │     │  ├─ 01-create-ordering-organization-components.yml
│  │     │  ├─ 10-join-peer-to-channel.yml
│  │     │  ├─ 12-create-endorsing-organization-components.yml
│  │     │  ├─ 09-lifecycle-endorsement-policy.json.j2
│  │     │  ├─ 06-add-organization-to-consortium.yml
│  │     │  ├─ 15-writers-policy.json.j2
│  │     │  ├─ 15-readers-policy.json.j2
│  │     │  └─ 00-complete.yml
│  │     └─ pkgcc.sh
│  ├─ high-throughput
│  │  ├─ application-go
│  │  │  ├─ app.go
│  │  │  ├─ go.sum
│  │  │  ├─ go.mod
│  │  │  └─ connect.go
│  │  ├─ README.md
│  │  ├─ startFabric.sh
│  │  ├─ chaincode-go
│  │  │  ├─ go.sum
│  │  │  ├─ go.mod
│  │  │  └─ high-throughput.go
│  │  └─ networkDown.sh
│  ├─ asset-transfer-secured-agreement
│  │  ├─ application-gateway-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ contractWrapper.ts
│  │  │  │  ├─ app.ts
│  │  │  │  ├─ connect.ts
│  │  │  │  └─ utils.ts
│  │  │  └─ tsconfig.json
│  │  ├─ README.md
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ README.md
│  │     ├─ go.mod
│  │     ├─ asset_transfer.go
│  │     └─ asset_transfer_queries.go
│  ├─ LICENSE
│  ├─ auction-dutch
│  │  ├─ chaincode-go-auditor
│  │  │  ├─ go.sum
│  │  │  ├─ smart-contract
│  │  │  │  ├─ utils.go
│  │  │  │  ├─ auction.go
│  │  │  │  └─ auctionQueries.go
│  │  │  ├─ go.mod
│  │  │  └─ smartContract.go
│  │  ├─ README.md
│  │  ├─ application-javascript
│  │  │  ├─ endAuctionwithAuditor.js
│  │  │  ├─ queryBid.js
│  │  │  ├─ submitBid.js
│  │  │  ├─ package.json
│  │  │  ├─ closeAuction.js
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ registerEnrollUser.js
│  │  │  ├─ queryAuction.js
│  │  │  ├─ createAuction.js
│  │  │  ├─ bid.js
│  │  │  ├─ enrollAdmin.js
│  │  │  ├─ .eslintignore
│  │  │  ├─ revealBid.js
│  │  │  └─ endAuction.js
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ smart-contract
│  │     │  ├─ utils.go
│  │     │  ├─ auction.go
│  │     │  └─ auctionQueries.go
│  │     ├─ go.mod
│  │     └─ smartContract.go
│  ├─ asset-transfer-basic
│  │  ├─ application-gateway-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  └─ app.ts
│  │  │  └─ tsconfig.json
│  │  ├─ README.md
│  │  ├─ application-gateway-javascript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  └─ src
│  │  │     └─ app.js
│  │  ├─ application-gateway-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ pom.xml
│  │  │  ├─ src
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ App.java
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  └─ gradlew.bat
│  │  ├─ chaincode-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ assetTransfer.ts
│  │  │  │  ├─ asset.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ .dockerignore
│  │  │  ├─ docker
│  │  │  │  └─ docker-entrypoint.sh
│  │  │  ├─ Dockerfile
│  │  │  └─ tsconfig.json
│  │  ├─ chaincode-java
│  │  │  ├─ gradlew
│  │  │  ├─ settings.gradle
│  │  │  ├─ src
│  │  │  │  ├─ test
│  │  │  │  │  └─ java
│  │  │  │  │     └─ org
│  │  │  │  │        └─ hyperledger
│  │  │  │  │           └─ fabric
│  │  │  │  │              └─ samples
│  │  │  │  │                 └─ assettransfer
│  │  │  │  │                    ├─ AssetTest.java
│  │  │  │  │                    └─ AssetTransferTest.java
│  │  │  │  └─ main
│  │  │  │     └─ java
│  │  │  │        └─ org
│  │  │  │           └─ hyperledger
│  │  │  │              └─ fabric
│  │  │  │                 └─ samples
│  │  │  │                    └─ assettransfer
│  │  │  │                       ├─ Asset.java
│  │  │  │                       └─ AssetTransfer.java
│  │  │  ├─ README.md
│  │  │  ├─ gradle
│  │  │  │  └─ wrapper
│  │  │  │     ├─ gradle-wrapper.properties
│  │  │  │     └─ gradle-wrapper.jar
│  │  │  ├─ build.gradle
│  │  │  ├─ docker
│  │  │  │  └─ docker-entrypoint.sh
│  │  │  ├─ Dockerfile
│  │  │  ├─ gradlew.bat
│  │  │  └─ config
│  │  │     └─ checkstyle
│  │  │        ├─ suppressions.xml
│  │  │        └─ checkstyle.xml
│  │  ├─ rest-api-go
│  │  │  ├─ go.sum
│  │  │  ├─ README.md
│  │  │  ├─ go.mod
│  │  │  ├─ web
│  │  │  │  ├─ app.go
│  │  │  │  ├─ query.go
│  │  │  │  ├─ initialize.go
│  │  │  │  └─ invoke.go
│  │  │  └─ main.go
│  │  ├─ application-gateway-go
│  │  │  ├─ assetTransfer.go
│  │  │  ├─ go.sum
│  │  │  └─ go.mod
│  │  ├─ chaincode-javascript
│  │  │  ├─ test
│  │  │  │  └─ assetTransfer.test.js
│  │  │  ├─ package.json
│  │  │  ├─ .eslintrc.js
│  │  │  ├─ npm-shrinkwrap.json
│  │  │  ├─ index.js
│  │  │  ├─ lib
│  │  │  │  ├─ assetTransfer.js
│  │  │  │  └─ ehrChainCode.js
│  │  │  └─ .eslintignore
│  │  ├─ chaincode-go
│  │  │  ├─ assetTransfer.go
│  │  │  ├─ go.sum
│  │  │  ├─ chaincode
│  │  │  │  ├─ mocks
│  │  │  │  │  ├─ statequeryiterator.go
│  │  │  │  │  ├─ transaction.go
│  │  │  │  │  └─ chaincodestub.go
│  │  │  │  ├─ smartcontract.go
│  │  │  │  └─ smartcontract_test.go
│  │  │  └─ go.mod
│  │  ├─ rest-api-typescript
│  │  │  ├─ .eslintrc.json
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  ├─ auth.ts
│  │  │  │  ├─ server.ts
│  │  │  │  ├─ fabric.ts
│  │  │  │  ├─ errors.spec.ts
│  │  │  │  ├─ jobs.spec.ts
│  │  │  │  ├─ logger.ts
│  │  │  │  ├─ config.spec.ts
│  │  │  │  ├─ errors.ts
│  │  │  │  ├─ redis.ts
│  │  │  │  ├─ __tests__
│  │  │  │  │  └─ api.test.ts
│  │  │  │  ├─ jobs.ts
│  │  │  │  ├─ fabric.spec.ts
│  │  │  │  ├─ config.ts
│  │  │  │  ├─ redis.spec.ts
│  │  │  │  └─ index.ts
│  │  │  ├─ jest.config.ts
│  │  │  ├─ README.md
│  │  │  ├─ package-lock.json
│  │  │  ├─ .editorconfig
│  │  │  ├─ .dockerignore
│  │  │  ├─ scripts
│  │  │  │  └─ generateEnv.sh
│  │  │  ├─ Dockerfile
│  │  │  ├─ tsconfig.json
│  │  │  ├─ docker-compose.yaml
│  │  │  └─ demo.http
│  │  └─ chaincode-external
│  │     ├─ crypto
│  │     ├─ docker-compose-chaincode.yaml
│  │     ├─ connection.json
│  │     ├─ assetTransfer.go
│  │     ├─ go.sum
│  │     ├─ README.md
│  │     ├─ sampleBuilder
│  │     │  └─ bin
│  │     │     ├─ detect
│  │     │     ├─ release
│  │     │     └─ build
│  │     ├─ metadata.json
│  │     ├─ go.mod
│  │     ├─ .dockerignore
│  │     └─ Dockerfile
│  ├─ hardware-security-module
│  │  ├─ application-go
│  │  │  ├─ go.sum
│  │  │  ├─ hsm-sample.go
│  │  │  └─ go.mod
│  │  ├─ README.md
│  │  ├─ application-typescript
│  │  │  ├─ eslint.config.mjs
│  │  │  ├─ package.json
│  │  │  ├─ src
│  │  │  │  └─ hsm-sample.ts
│  │  │  └─ tsconfig.json
│  │  ├─ scripts
│  │  │  └─ generate-hsm-user.sh
│  │  └─ ca-client-config
│  │     └─ fabric-ca-client-config-template.yaml
│  ├─ token-sdk
│  │  ├─ explorer
│  │  │  ├─ connection-profile
│  │  │  │  └─ test-network.json
│  │  │  ├─ config.json
│  │  │  └─ docker-compose.yaml
│  │  ├─ components.png
│  │  ├─ go.work.sum
│  │  ├─ README.md
│  │  ├─ auditor
│  │  │  ├─ go.sum
│  │  │  ├─ service
│  │  │  │  ├─ audit.go
│  │  │  │  ├─ balance.go
│  │  │  │  └─ history.go
│  │  │  ├─ go.mod
│  │  │  ├─ conf
│  │  │  │  └─ core.yaml
│  │  │  ├─ main.go
│  │  │  └─ oapi-server.yaml
│  │  ├─ owner
│  │  │  ├─ go.sum
│  │  │  ├─ service
│  │  │  │  ├─ transfer.go
│  │  │  │  ├─ accept.go
│  │  │  │  ├─ balance.go
│  │  │  │  ├─ history.go
│  │  │  │  └─ redeem.go
│  │  │  ├─ go.mod
│  │  │  ├─ conf
│  │  │  │  ├─ owner1
│  │  │  │  │  └─ core.yaml
│  │  │  │  └─ owner2
│  │  │  │     └─ core.yaml
│  │  │  ├─ main.go
│  │  │  └─ oapi-server.yaml
│  │  ├─ issuer
│  │  │  ├─ go.sum
│  │  │  ├─ service
│  │  │  │  └─ issue.go
│  │  │  ├─ go.mod
│  │  │  ├─ conf
│  │  │  │  └─ core.yaml
│  │  │  ├─ main.go
│  │  │  └─ oapi-server.yaml
│  │  ├─ transfer.png
│  │  ├─ go.work
│  │  ├─ compose-ca.yaml
│  │  ├─ e2e
│  │  │  ├─ go.sum
│  │  │  ├─ client.gen.go
│  │  │  ├─ oapi-client.yaml
│  │  │  ├─ go.mod
│  │  │  └─ e2e_test.go
│  │  ├─ .dockerignore
│  │  ├─ tokenchaincode
│  │  │  └─ Dockerfile
│  │  ├─ scripts
│  │  │  ├─ up.sh
│  │  │  ├─ down.sh
│  │  │  └─ enroll-users.sh
│  │  ├─ Dockerfile
│  │  ├─ docker-compose.yaml
│  │  ├─ dependencies.png
│  │  └─ swagger.yaml
│  ├─ config
│  │  ├─ configtx.yaml
│  │  ├─ orderer.yaml
│  │  └─ core.yaml
│  ├─ token-erc-1155
│  │  ├─ README.md
│  │  └─ chaincode-go
│  │     ├─ go.sum
│  │     ├─ erc1155.go
│  │     ├─ chaincode
│  │     │  └─ contract.go
│  │     └─ go.mod
│  └─ token-erc-20
│     ├─ README.md
│     ├─ chaincode-java
│     │  ├─ gradlew
│     │  ├─ settings.gradle
│     │  ├─ src
│     │  │  ├─ test
│     │  │  │  ├─ resources
│     │  │  │  │  └─ mockito-extensions
│     │  │  │  │     └─ org.mockito.plugins.MockMaker
│     │  │  │  └─ java
│     │  │  │     └─ org
│     │  │  │        └─ hyperledger
│     │  │  │           └─ fabric
│     │  │  │              └─ samples
│     │  │  │                 └─ erc20
│     │  │  │                    └─ TokenERC20ContractTest.java
│     │  │  └─ main
│     │  │     └─ java
│     │  │        └─ org
│     │  │           └─ hyperledger
│     │  │              └─ fabric
│     │  │                 └─ samples
│     │  │                    └─ erc20
│     │  │                       ├─ model
│     │  │                       │  ├─ Transfer.java
│     │  │                       │  └─ Approval.java
│     │  │                       ├─ utils
│     │  │                       │  └─ ContractUtility.java
│     │  │                       ├─ ERC20TokenContract.java
│     │  │                       ├─ ContractConstants.java
│     │  │                       └─ ContractErrors.java
│     │  ├─ gradle
│     │  │  └─ wrapper
│     │  │     ├─ gradle-wrapper.properties
│     │  │     └─ gradle-wrapper.jar
│     │  ├─ build.gradle
│     │  ├─ docker
│     │  │  └─ docker-entrypoint.sh
│     │  ├─ Dockerfile
│     │  ├─ gradlew.bat
│     │  └─ config
│     │     └─ checkstyle
│     │        ├─ suppressions.xml
│     │        └─ checkstyle.xml
│     ├─ chaincode-javascript
│     │  ├─ test
│     │  │  └─ tokenERC20.test.js
│     │  ├─ package.json
│     │  ├─ .eslintrc.js
│     │  ├─ npm-shrinkwrap.json
│     │  ├─ index.js
│     │  ├─ .editorconfig
│     │  ├─ lib
│     │  │  └─ tokenERC20.js
│     │  └─ .eslintignore
│     └─ chaincode-go
│        ├─ go.sum
│        ├─ chaincode
│        │  └─ token_contract.go
│        ├─ go.mod
│        └─ token_erc_20.go
├─ README.md
├─ server-node-sdk
│  ├─ package.json
│  ├─ package-lock.json
│  ├─ invoke.js
│  ├─ helper.js
│  ├─ cert-script
│  │  ├─ onboardInsuranceAgent.js
│  │  ├─ onboardInsuranceCompany.js
│  │  ├─ registerOrg2Admin.js
│  │  ├─ callChaincode.js
│  │  ├─ onboardHospital01.js
│  │  ├─ registerOrg1Admin.js
│  │  └─ onboardDoctor.js
│  ├─ query.js
│  ├─ wallet
│  │  ├─ patient-001.id
│  │  ├─ insuranceAgent-Rama.id
│  │  ├─ anuj.id
│  │  ├─ Doctor-Rama04.id
│  │  ├─ hospitalAdmin.id
│  │  ├─ insuranceAdmin.id
│  │  ├─ Hospital01.id
│  │  └─ insuranceCompany01.id
│  └─ app.js
├─ LICENSE
└─ install-fabric.sh

```