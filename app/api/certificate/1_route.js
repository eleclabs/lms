import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

import fs from "fs";
import path from "path";

import { getCourseDetails } from "@/queries/courses";
import { getLoggedInUser } from "@/lib/loggedin-user";
import { getReport } from "@/queries/reports";
import { formatMyDate } from "@/lib/date";

/* -----------------
 *
 * Helpers
 *
 *-------------------*/
function loadFile(filePath) {
  const fullPath = path.join(process.cwd(), "public", filePath);
  return fs.readFileSync(fullPath);
}

/* -----------------
 *
 * API
 *
 *-------------------*/
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const courseId = searchParams.get("courseId");

    const course = await getCourseDetails(courseId);
    const loggedInUser = await getLoggedInUser();

    const report = await getReport({
      course: courseId,
      student: loggedInUser.id,
    });

    const completionDate = report?.completion_date
      ? formatMyDate(report?.completion_date)
      : formatMyDate(Date.now());

    const completionInfo = {
      name: `${loggedInUser?.firstName} ${loggedInUser?.lastName}`,
      completionDate,
      courseName: course.title,
      instructor: `${course?.instructor?.firstName} ${course?.instructor?.lastName}`,
      instructorDesignation: `${course?.instructor?.designation}`,
    };

    /* -----------------
     *
     * Load Fonts (LOCAL)
     *
     *-------------------*/
    const kalamFontBytes = loadFile("fonts/kalam/Kalam-Regular.ttf");
    const montserratItalicFontBytes = loadFile(
      "fonts/montserrat/Montserrat-Italic.ttf"
    );
    const montserratFontBytes = loadFile(
      "fonts/montserrat/Montserrat-Medium.ttf"
    );

    /* -----------------
     *
     * PDF Setup
     *
     *-------------------*/
    const pdfDoc = await PDFDocument.create();
    pdfDoc.registerFontkit(fontkit);

    const kalamFont = await pdfDoc.embedFont(kalamFontBytes);
    const montserratItalic = await pdfDoc.embedFont(
      montserratItalicFontBytes
    );
    const montserrat = await pdfDoc.embedFont(montserratFontBytes);

    const timesRomanFont = await pdfDoc.embedFont(
      StandardFonts.TimesRoman
    );

    const page = pdfDoc.addPage([841.89, 595.28]);
    const { width, height } = page.getSize();

    /* -----------------
     *
     * Logo
     *
     *-------------------*/
    const logoBytes = loadFile("logo.png");
    const logo = await pdfDoc.embedPng(logoBytes);
    const logoDimns = logo.scale(0.5);

    page.drawImage(logo, {
      x: width / 2 - logoDimns.width / 2,
      y: height - 120,
      width: logoDimns.width,
      height: logoDimns.height,
    });

    /* -----------------
     *
     * Title
     *
     *-------------------*/
    const titleText = "Certificate Of Completion";
    const titleFontSize = 30;

    const titleWidth = montserrat.widthOfTextAtSize(
      titleText,
      titleFontSize
    );

    page.drawText(titleText, {
      x: width / 2 - titleWidth / 2,
      y: height - (logoDimns.height + 125),
      size: titleFontSize,
      font: montserrat,
      color: rgb(0, 0.53, 0.71),
    });

    /* -----------------
     *
     * Name Label
     *
     *-------------------*/
    const nameLabel = "This certificate is hereby bestowed upon";
    const nameLabelSize = 20;

    const nameLabelWidth = montserratItalic.widthOfTextAtSize(
      nameLabel,
      nameLabelSize
    );

    page.drawText(nameLabel, {
      x: width / 2 - nameLabelWidth / 2,
      y: height - (logoDimns.height + 170),
      size: nameLabelSize,
      font: montserratItalic,
    });

    /* -----------------
     *
     * Name
     *
     *-------------------*/
    const nameText = completionInfo.name;
    const nameSize = 40;

    const nameWidth = timesRomanFont.widthOfTextAtSize(
      nameText,
      nameSize
    );

    page.drawText(nameText, {
      x: width / 2 - nameWidth / 2,
      y: height - (logoDimns.height + 220),
      size: nameSize,
      font: kalamFont,
    });

    /* -----------------
     *
     * Details
     *
     *-------------------*/
    const detailsText = `This is to certify that ${completionInfo.name} successfully completed the ${completionInfo.courseName} course on ${completionInfo.completionDate} by ${completionInfo.instructor}`;

    page.drawText(detailsText, {
      x: width / 2 - 700 / 2,
      y: height - 330,
      size: 16,
      font: montserrat,
      maxWidth: 700,
      wordBreaks: [" "],
    });

    /* -----------------
     *
     * Signature
     *
     *-------------------*/
    const signatureBoxWidth = 300;

    page.drawText(completionInfo.instructor, {
      x: width - signatureBoxWidth,
      y: 90,
      size: 16,
      font: timesRomanFont,
    });

    page.drawText(completionInfo.instructorDesignation, {
      x: width - signatureBoxWidth,
      y: 72,
      size: 10,
      font: timesRomanFont,
      maxWidth: 250,
    });

    page.drawLine({
      start: { x: width - signatureBoxWidth, y: 110 },
      end: { x: width - 60, y: 110 },
      thickness: 1,
    });

    const signBytes = loadFile("sign.png");
    const sign = await pdfDoc.embedPng(signBytes);

    page.drawImage(sign, {
      x: width - signatureBoxWidth,
      y: 120,
      width: 180,
      height: 54,
    });

    /* -----------------
     *
     * Background Pattern
     *
     *-------------------*/
    const patternBytes = loadFile("pattern.jpg");
    const pattern = await pdfDoc.embedJpg(patternBytes);

    page.drawImage(pattern, {
      x: 0,
      y: 0,
      width,
      height,
      opacity: 0.2,
    });

    /* -----------------
     *
     * Response
     *
     *-------------------*/
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=certificate.pdf",
      },
    });
  } catch (error) {
    console.error("CERTIFICATE ERROR:", error);
    return new Response("Failed to generate certificate", { status: 500 });
  }
}