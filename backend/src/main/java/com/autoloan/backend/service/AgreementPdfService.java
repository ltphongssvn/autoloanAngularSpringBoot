// backend/src/main/java/com/autoloan/backend/service/AgreementPdfService.java
package com.autoloan.backend.service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import com.autoloan.backend.exception.BadRequestException;
import com.autoloan.backend.exception.ResourceNotFoundException;
import com.autoloan.backend.model.Address;
import com.autoloan.backend.model.Application;
import com.autoloan.backend.model.User;
import com.autoloan.backend.model.Vehicle;
import com.autoloan.backend.model.enums.ApplicationStatus;
import com.autoloan.backend.repository.ApplicationRepository;

@Service
public class AgreementPdfService {

    private final ApplicationRepository applicationRepository;

    public AgreementPdfService(ApplicationRepository applicationRepository) {
        this.applicationRepository = applicationRepository;
    }

    public PdfResult generate(Long applicationId, Long userId, String role) {
        Application app;
        boolean isStaff = "LOAN_OFFICER".equals(role) || "UNDERWRITER".equals(role);
        if (isStaff) {
            app = applicationRepository.findById(applicationId)
                    .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        } else {
            app = applicationRepository.findByIdAndUserId(applicationId, userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        }

        if (app.getStatus() != ApplicationStatus.APPROVED && app.getStatus() != ApplicationStatus.SIGNED) {
            throw new BadRequestException("PDF only available for approved or signed applications");
        }

        String appNum = app.getApplicationNumber() != null
                ? app.getApplicationNumber()
                : "APP-" + String.format("%04d", app.getId());

        byte[] pdfBytes = buildPdf(app, appNum);
        String filename = "loan_agreement_" + appNum + ".pdf";
        return new PdfResult(pdfBytes, filename);
    }

    byte[] buildPdf(Application app, String appNum) {
        try (PDDocument doc = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.LETTER);
            doc.addPage(page);

            PDType1Font fontBold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            PDType1Font fontRegular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);

            User user = app.getUser();
            Address address = app.getAddresses().stream()
                    .filter(a -> "residential".equals(a.getAddressType()))
                    .findFirst().orElse(app.getAddresses().isEmpty() ? null : app.getAddresses().get(0));
            Vehicle vehicle = app.getVehicles().isEmpty() ? null : app.getVehicles().get(0);

            BigDecimal loanAmount = app.getLoanAmount() != null ? app.getLoanAmount() : BigDecimal.ZERO;
            BigDecimal downPayment = app.getDownPayment() != null ? app.getDownPayment() : BigDecimal.ZERO;
            BigDecimal principal = loanAmount.subtract(downPayment);
            BigDecimal rate = app.getInterestRate() != null ? app.getInterestRate() : BigDecimal.ZERO;
            int term = app.getLoanTerm() != null ? app.getLoanTerm() : 48;
            BigDecimal monthly = app.getMonthlyPayment() != null ? app.getMonthlyPayment() : BigDecimal.ZERO;
            BigDecimal totalPayments = monthly.multiply(BigDecimal.valueOf(term));
            BigDecimal totalInterest = totalPayments.subtract(principal);

            float y = 740;
            float margin = 50;

            try (PDPageContentStream cs = new PDPageContentStream(doc, page)) {
                // Header
                y = drawCenteredText(cs, fontBold, 20, "AUTO LOAN AGREEMENT", page, y);
                y -= 20;
                y = drawCenteredText(cs, fontRegular, 12, "Loan Agreement #" + appNum, page, y);
                y -= 15;
                y = drawCenteredText(cs, fontRegular, 10, "Date: " + formatDate(LocalDate.now()), page, y);
                y -= 30;

                // Borrower Information
                y = drawSectionHeader(cs, fontBold, "BORROWER INFORMATION", margin, y);
                String name = (user != null) ? (user.getFirstName() + " " + user.getLastName()) : "N/A";
                y = drawRow(cs, fontBold, fontRegular, "Name:", name, margin, y);
                String addr = address != null
                        ? (address.getStreetAddress() + ", " + address.getCity() + ", " + address.getState() + " " + address.getZipCode())
                        : "N/A";
                y = drawRow(cs, fontBold, fontRegular, "Address:", addr, margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Phone:", user != null ? user.getPhone() : "N/A", margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Email:", user != null ? user.getEmail() : "N/A", margin, y);
                y -= 15;

                // Loan Details
                y = drawSectionHeader(cs, fontBold, "LOAN DETAILS", margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Loan Amount:", "$" + fmt(loanAmount), margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Down Payment:", "$" + fmt(downPayment), margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Amount Financed:", "$" + fmt(principal), margin, y);
                y = drawRow(cs, fontBold, fontRegular, "APR:", rate + "%", margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Loan Term:", term + " months", margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Monthly Payment:", "$" + fmt(monthly), margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Total of Payments:", "$" + fmt(totalPayments), margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Total Interest:", "$" + fmt(totalInterest), margin, y);
                y -= 15;

                // Vehicle Information
                y = drawSectionHeader(cs, fontBold, "VEHICLE INFORMATION", margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Year:", vehicle != null ? String.valueOf(vehicle.getYear()) : "N/A", margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Make:", vehicle != null ? vehicle.getMake() : "N/A", margin, y);
                y = drawRow(cs, fontBold, fontRegular, "Model:", vehicle != null ? vehicle.getModel() : "N/A", margin, y);
                y = drawRow(cs, fontBold, fontRegular, "VIN:", vehicle != null && vehicle.getVin() != null ? vehicle.getVin() : "N/A", margin, y);
                y -= 15;

                // Terms
                y = drawSectionHeader(cs, fontBold, "TERMS AND CONDITIONS", margin, y);
                String[] terms2 = {
                    "1. The Borrower agrees to repay the loan amount plus interest as specified above.",
                    "2. Late payments may result in additional fees and penalties.",
                    "3. The vehicle serves as collateral for this loan.",
                    "4. Full payoff is permitted at any time without prepayment penalty.",
                    "5. Borrower must maintain full coverage insurance on the vehicle.",
                };
                for (String t : terms2) {
                    y = drawText(cs, fontRegular, 9, t, margin, y);
                    y -= 4;
                }
                y -= 20;

                // Signature
                y = drawSectionHeader(cs, fontBold, "SIGNATURES", margin, y);
                cs.moveTo(margin, y);
                cs.lineTo(300, y);
                cs.stroke();
                y -= 15;
                y = drawText(cs, fontRegular, 10, "Borrower: " + name, margin, y);
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            doc.save(baos);
            return baos.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }

    private float drawCenteredText(PDPageContentStream cs, PDType1Font font, float size, String text, PDPage page, float y) throws IOException {
        float textWidth = font.getStringWidth(text) / 1000 * size;
        float x = (page.getMediaBox().getWidth() - textWidth) / 2;
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
        return y - size - 2;
    }

    private float drawSectionHeader(PDPageContentStream cs, PDType1Font font, String text, float x, float y) throws IOException {
        cs.beginText();
        cs.setFont(font, 13);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
        return y - 20;
    }

    private float drawRow(PDPageContentStream cs, PDType1Font boldFont, PDType1Font regularFont, String label, String value, float x, float y) throws IOException {
        cs.beginText();
        cs.setFont(boldFont, 10);
        cs.newLineAtOffset(x, y);
        cs.showText(label);
        cs.endText();
        cs.beginText();
        cs.setFont(regularFont, 10);
        cs.newLineAtOffset(x + 160, y);
        cs.showText(value != null ? value : "N/A");
        cs.endText();
        return y - 14;
    }

    private float drawText(PDPageContentStream cs, PDType1Font font, float size, String text, float x, float y) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
        return y - size - 2;
    }

    private String fmt(BigDecimal n) {
        return String.format("%,.2f", n);
    }

    private String formatDate(LocalDate d) {
        return d.format(DateTimeFormatter.ofPattern("MMMM dd, yyyy"));
    }

    public static class PdfResult {
        private final byte[] buffer;
        private final String filename;

        public PdfResult(byte[] buffer, String filename) {
            this.buffer = buffer;
            this.filename = filename;
        }

        public byte[] getBuffer() { return buffer; }
        public String getFilename() { return filename; }
    }
}
