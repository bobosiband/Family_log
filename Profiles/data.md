# Data Structure
```js
let data = {
    despatchAdvices: [
        {
            despatchAdviceId: "565899",
            copyIndicator: false,
            uuid: "88C7280E-8F10-419F-9949-8EFFFA2842B8",
            issueDate: "2005-06-20",
            documentStatusCode: "NoStatus",
            despatchAdviceTypeCode: "delivery",
            note: "sample",
            orderReference: {
                orderId: "AEG012345",
                salesOrderId: "CON0095678",
                uuid: "6E09886B-DC6E-439F-82D1-7CCAC7F4E3B1",
                issueDate: "2005-06-20"
            },
            despatchSupplierParty: {
                customerAssignedAccountId: "CO001",
                party: {
                    partyName: "Consortial",
                    postalAddress: {
                        streetName: "Busy Street",
                        buildingName: "Thereabouts",
                        buildingNumber: "56A",
                        cityName: "Farthing",
                        postalZone: "AA99 1BB",
                        countrySubentity: "Heremouthshire",
                        addressLine: "The Roundabout",
                        country: "GB"
                    },
                    partyTaxScheme: {
                        registrationName: "Farthing Purchasing Consortium",
                        companyId: "175 269 2355",
                        exemptionReason: "N/A",
                        taxScheme: {
                            id: "VAT",
                            taxTypeCode: "VAT"
                        }
                    },
                    contact: {
                        name: "Mrs Bouquet",
                        telephone: "0158 1233714",
                        telefax: "0158 1233856",
                        email: "bouquet@fpconsortial.co.uk"
                    }
                }
            },
            deliveryCustomerParty: {
                customerAssignedAccountId: "XFB01",
                supplierAssignedAccountId: "GT00978567",
                party: {
                    partyName: "IYT Corporation",
                    postalAddress: {
                        streetName: "Avon Way",
                        buildingName: "Thereabouts",
                        buildingNumber: "56A",
                        cityName: "Bridgtow",
                        postalZone: "ZZ99 1ZZ",
                        countrySubentity: "Avon",
                        addressLine: "3rd Floor, Room 5",
                        country: "GB"
                    },
                    partyTaxScheme: {
                        registrationName: "Bridgtow District Council",
                        companyId: "12356478",
                        exemptionReason: "Local Authority",
                        taxScheme: {
                            id: "UK VAT",
                            taxTypeCode: "VAT"
                        }
                    },
                    contact: {
                        name: "Mr Fred Churchill",
                        telephone: "0127 2653214",
                        telefax: "0127 2653215",
                        email: "fred@iytcorporation.gov.uk"
                    }
                }
            },
            shipment: {
                shipmentId: "1",
                consignment: {
                    consignmentId: "1"
                },
                delivery: {
                    deliveryAddress: {
                        streetName: "Avon Way",
                        buildingName: "Thereabouts",
                        buildingNumber: "56A",
                        cityName: "Bridgtow",
                        postalZone: "ZZ99 1ZZ",
                        countrySubentity: "Avon",
                        addressLine: "3rd Floor, Room 5",
                        country: "GB"
                    },
                    requestedDeliveryPeriod: {
                        startDate: "2005-06-20",
                        startTime: "10:30:47.0Z",
                        endDate: "2005-06-21",
                        endTime: "10:30:47.0Z"
                    }
                }
            },
            despatchLines: [
                {
                    lineId: "1",
                    note: "Mrs Green agreed to waive charge",
                    lineStatusCode: "NoStatus",
                    deliveredQuantity: { unitCode: "KGM", value: 90 },
                    backorderQuantity: { unitCode: "KGM", value: 10 },
                    backorderReason: "lack of stock as explained on telephone today",
                    orderLineReference: {
                        lineId: "1",
                        salesOrderLineId: "A",
                        orderReference: {
                            orderId: "AEG012345",
                            salesOrderId: "CON0095678",
                            uuid: "6E09886B-DC6E-439F-82D1-7CCAC7F4E3B1",
                            issueDate: "2005-06-20"
                        }
                    },
                    item: {
                        description: "Acme beeswax",
                        name: "beeswax",
                        buyersItemId: "6578489",
                        sellersItemId: "17589683",
                        itemInstance: {
                            lotIdentification: {
                                lotNumberId: "546378239",
                                expiryDate: "2010-01-01"
                            }
                        }
                    }
                }
            ]
        }
    ]
}
```