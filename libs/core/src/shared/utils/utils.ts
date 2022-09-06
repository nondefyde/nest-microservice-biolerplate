import * as mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import * as _ from 'lodash';
import * as dateFns from 'date-fns';
import { Between } from 'typeorm';

export class Utils {
  public static generateRandomNumber(length): number {
    // Generate a random {length} digit code
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * Math.pow(10, length - 1) * 9,
    );
  }

  /**
   * @param {Number} min
   * @return {Date} The date
   */
  public static addMinToDate(min = 1) {
    const date = new Date();
    const minutes = date.getMinutes() + min;
    date.setMinutes(minutes);
    return date;
  }

  /**
   * @param {Number} hour
   * @return {Date} The date
   */
  public static addHourToDate(hour = 1) {
    const date = new Date();
    const hours = date.getHours() + hour;
    date.setHours(hours);
    return date;
  }

  /**
   * @param {Number} size Code length
   * @param {Boolean} alpha Check if it's alpha numeral
   * @return {String} The code
   */
  static generateOTCode = (size = 6, alpha = false) => {
    const characters = alpha
      ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
      : '0123456789';
    const charactersArray = characters.split('');
    let selections = '';
    for (let i = 0; i < size; i++) {
      const index = Math.floor(Math.random() * charactersArray.length);
      selections += charactersArray[index];
      charactersArray.splice(index, 1);
    }
    return selections;
  };

  /**
   * @param {String} key the prefix for the id
   * @param {Number} length the length of the id
   * @return {Date} The date
   */
  static generateUniqueId(key: string) {
    return `${key || 'key'}-${uuidv4()}`;
  }

  /**
   * convert to uppercase 1st letter
   * @param value
   * @return {Boolean} The code
   */
  static IsObjectId(value) {
    try {
      return (
        value &&
        value.length > 12 &&
        String(new mongoose.Types.ObjectId(value)) === String(value)
      );
    } catch (e) {
      return false;
    }
  }

  /**
   * Add days to a date
   * @param {Date} date The date
   * @param days days to add
   * @return {Boolean} The code
   */
  static addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * modifies mobile with isocode
   * @param {String} mobile
   * @return {String} mobileNoT
   */
  static cleanUpMobileNumber(mobile) {
    let mobileNo = mobile.toString().trim();
    if (mobileNo.substring(0, 1) === '0' && mobileNo.length === 11) {
      mobileNo = `234${mobileNo.substring(1)}`;
    } else if (mobileNo.substring(0, 1) !== '+') {
      mobileNo = `${mobileNo}`;
    }
    // return '2348075889776'
    return mobileNo;
  }

  /**
   * @param {Object} object The payload object
   * @param {String} key to be updated,
   * @return {Object}
   */
  static updateVerification(object, key) {
    const verifications = {
      ...object.verifications,
      [key]: true,
    };
    const verificationCodes = _.omit(
      {
        ...object.verificationCodes,
      },
      [key],
    );
    return { verifications, verificationCodes };
  }

  /**
   * {Date} Generate date range of a single date based on start and end of day
   */
  public static generateSingleDateRange(date: string, dbType = 'NoSQL') {
    const startDate = dateFns.startOfDay(dateFns.parseISO(date));
    const endDate = dateFns.endOfDay(dateFns.parseISO(date));
    return dbType === 'NoSql'
      ? { $lte: startDate, $gte: endDate }
      : Between(startDate, endDate);
  }
  
  /**
   * Generate date range based on give start and end dates
   */
  public static generateDateRange(obj: any, dbType = 'NoSQL') {
    try {
      const dateRange: any = JSON.parse(obj);
      if (dateRange && dateRange.startDate && dateRange.endDate) {
        const startDate = dateFns.startOfDay(
          dateFns.parseISO(dateRange.startDate)
        );
        const endDate = dateFns.endOfDay(dateFns.parseISO(dateRange.endDate));
        return dbType === 'NoSQL'
          ? { $lte: startDate, $gte: endDate }
          : Between(startDate, endDate);
      }
      return this.generateSingleDateRange(
        dateRange.startDate || dateRange.endDate || new Date(),
        dbType
      );
    } catch (e) {
      return this.generateSingleDateRange(obj, dbType);
    }
  }
}
