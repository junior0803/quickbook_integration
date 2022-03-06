import quick_axios from './axios';

class QuickBook {
    // RequestToken for QuickBook Integration
    public requestToken(): Promise<any> {
        return quick_axios.get('/requestToken');
    }

    public getInvoice() : Promise<any> {
        return quick_axios.get('/invoices');
    }
}

export const Quick_Book = new QuickBook();