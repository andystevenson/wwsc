import { log } from "node:console";
import { getDevices } from "usb-barcode-scanner-2";

console.log("hello devices", getDevices());
