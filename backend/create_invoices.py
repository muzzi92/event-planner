from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

def create_invoice(filename, vendor, amount, due_date):
    c = canvas.Canvas(filename, pagesize=letter)
    c.drawString(100, 750, "Invoice")
    c.drawString(100, 700, f"Vendor: {vendor}")
    c.drawString(100, 680, f"Amount: {amount}")
    c.drawString(100, 660, f"Due Date: {due_date}")
    c.save()

if __name__ == '__main__':
    create_invoice("invoice1.pdf", "The Venue", 5000, "2025-10-01")
    create_invoice("invoice2.pdf", "The Caterer", 2500, "2025-10-15")
