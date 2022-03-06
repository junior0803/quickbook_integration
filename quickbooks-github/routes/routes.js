const express = require('express')
const OAuthClient = require('intuit-oauth')
const router = express.Router()
const Function = require("../function.js")


const oauthClient = Function.getOAuth()

router.get('/', function (req, res) {
    const accessToken = req.cookies.access_token
    if (accessToken)
        res.redirect('/home')

    res.render('login.ejs')
})

router.get('/home', function (req, res) {
    res.render('home.ejs')
})

router.get('/create_customer', function (req, res) {
    res.render('create_customer.ejs')
})

router.get('/create_invoice/:customer_id', function (req, res) {
    const qbo = Function.getQBO(req.cookies.access_token, req.cookies.refresh_token)
    qbo.findItems(
        {
            type: 'Inventory',
            limit: 15
        },
        function (e, searchResults) {
            const items = searchResults.QueryResponse.Item
            res.render('create_invoice.ejs', { items: items, customer_id: req.params.customer_id })
        }, this)
})

router.post('/create_invoice', function (req, res) {
    const qbo = Function.getQBO(req.cookies.access_token, req.cookies.refresh_token)

    if (!req.body.item_select) {
        res.render('error_page.ejs', { errorMessage: { Message: 'No Item Selected', Detail: 'You Must Select an Item' } })
    } else {
        const customer_id = req.body.customer_id;
        const invoice_qty = req.body.invoice_qty;
        const ItemRef = req.body.item_select.split('; ');
        const invoice_amt = req.body.invoice_amt;
        let ItemBeforeInvoice;

        //Make getItem request to get Item data
        qbo.getItem(ItemRef[1], function (err, item) {
            ItemBeforeInvoice = item;
        })

        //The post body for the Invoice create call
        qbo.createInvoice({
            "Line": [
                {
                    "Amount": invoice_amt,
                    "DetailType": "SalesItemLineDetail",
                    "SalesItemLineDetail": {
                        "ItemRef": {
                            "value": ItemRef[1],
                            "name": ItemRef[0]
                        },
                        "Qty": invoice_qty
                    }
                }
            ],
            "CustomerRef": {
                "value": customer_id
            }
        }, function (err, invoice) {
            //If there is an err, render the errorPage with the errorMessage from the response
            if (err) {
                res.render('error_page.ejs', { errorMessage: err.Fault.Error[0] })
            }
            else {
                res.redirect('/show_invoices/'+customer_id)
            }
        })
    }
})

router.post('/create_customer', function (req, res) {
    const qbo = Function.getQBO(req.cookies.access_token, req.cookies.refresh_token)

    qbo.createCustomer({
        "BillAddr": {
            "Line1": req.body.line1,
            "City": req.body.city,
            "Country": req.body.country,
            "CountrySubDivisionCode": req.body.province,
            "PostalCode": req.body.post_code
        },
        "Notes": "Here are other details.",
        "Title": req.body.title,
        "GivenName": req.body.given_name,
        "MiddleName": req.body.middle_name,
        "FamilyName": req.body.family_name,
        "Suffix": req.body.suffix,
        "DisplayName": req.body.display_name
    }, function (err, customer) {
        //if there is an error, render the error page with the error message, else render the createcustomer view
        if (err) {
            console.log(err.Fault)
            res.render('error_page.ejs', { errorMessage: err.Fault.Error[0] })
        }
        else {
            res.render('customer_detail.ejs', {
                displayName: customer.DisplayName,
                billingAddr: customer.BillAddr,
                id: customer.Id
            });
        }
    })
})

router.post('/create_invoice', function (req, res) {
    const qbo = Function.getQBO(req.cookies.access_token, req.cookies.refresh_token)

    qbo.createInvoice({
        "BillAddr": {
            "Line1": req.body.line1,
            "City": req.body.city,
            "Country": req.body.country,
            "CountrySubDivisionCode": req.body.province,
            "PostalCode": req.body.post_code
        },
        "Notes": "Here are other details.",
        "Title": req.body.title,
        "GivenName": req.body.given_name,
        "MiddleName": req.body.middle_name,
        "FamilyName": req.body.family_name,
        "Suffix": req.body.suffix,
        "DisplayName": req.body.display_name
    }, function (err, customer) {
        //if there is an error, render the error page with the error message, else render the createcustomer view
        if (err) {
            console.log(err.Fault)
            res.render('error_page.ejs', { errorMessage: err.Fault.Error[0] })
        }
        else {
            res.render('customer_detail.ejs', {
                displayName: customer.DisplayName,
                billingAddr: customer.BillAddr,
                id: customer.Id
            });
        }
    })
})

// Get Customers
router.get('/customers', function (req, res) {
    console.log("/customers")
    const qbo = Function.getQBO(req.cookies.access_token, req.cookies.refresh_token)

    qbo.findCustomers('', function (err, resp) {
        if (resp.fault && resp.fault.type === 'AUTHENTICATION')
            res.redirect('/')

        const respJson = JSON.parse(JSON.stringify(resp))
        console.log(respJson)
        res.render('customers', {
            customers: respJson['QueryResponse']['Customer']
        })
    })
})

// Get Invoices
router.get('/invoices', function (req, res) {
    const qbo = Function.getQBO(req.cookies.access_token, req.cookies.refresh_token)

    qbo.findInvoices('', function (err, resp) {
        if (resp.fault && resp.fault.type === 'AUTHENTICATION')
            res.redirect('/')

        const respJson = JSON.parse(JSON.stringify(resp))
        console.log(respJson)
        res.render('invoices', {
            invoices: respJson['QueryResponse']['Invoice']
        })
    })
})

// Get Invoices for given customer
router.get('/show_invoices/:customer_id', function (req, res) {
    const qbo = Function.getQBO(req.cookies.access_token, req.cookies.refresh_token)
    const customerID = req.params['customer_id']

    qbo.findInvoices(`where CustomerRef='${customerID}'`, function (err, resp) {
        if (resp.fault && resp.fault.type === 'AUTHENTICATION')
            res.redirect('/')

        const respJson = JSON.parse(JSON.stringify(resp))
        res.render('customer_invoices', {
            invoices: respJson['QueryResponse']['Invoice'] ? respJson['QueryResponse']['Invoice'] : [],
            customer_id: customerID
        })
    })

    res.redirect(authUri)
})
/*
Authentication
 */
// Quickbook RequestToken Api
router.get('/requestToken', function (req, res) {
    console.log("Route: /requestToken")

    const authUri = oauthClient
        .authorizeUri({
            scope: [OAuthClient.scopes.Accounting, OAuthClient.scopes.OpenId],
            state: 'testState'
        })

    res.set('Access-Control-Allow-Origin', '*')
    res.redirect(authUri)
})

router.get('/callback', function (req, res) {
    // Parse the redirect URL for authCode and exchange them for tokens
    const parseRedirect = req.url;

    // Exchange the auth code retrieved from the **req.url** on the redirectUri
    oauthClient
        .createToken(parseRedirect)
        .then(function(authResponse) {
            const response = JSON.parse(JSON.stringify(authResponse.getJson()))

            res.cookie('access_token', response['access_token']);
            res.cookie('refresh_token', response['refresh_token']);

            res.redirect('/home')
        })
        .catch(function(e) {
            console.error("The error message is :"+e.originalMessage);
        });
})

module.exports = router;