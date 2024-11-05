import { UsbScanner } from "usb-barcode-scanner-2";

let scanner = new UsbScanner({
  vendorId: 13547,
  productId: 5378,
  /** You could also initialize the scanner by giving entering the path variable:
   *  path: 'IOService:/AppleACPI etc...'
   */
  // path: "DevSrvsID:4295574875",
});

scanner.on("data", (data) => {
  console.log(data);
});

scanner.startScanning();
