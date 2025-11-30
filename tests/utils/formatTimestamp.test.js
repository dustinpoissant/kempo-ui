import formatTimestamp from '../../src/utils/formatTimestamp.js';

const testTimestamp = new Date(2024, 5, 15, 9, 5, 3, 7).getTime();

export default {
  'should export a function': ({pass, fail}) => {
    if(typeof formatTimestamp === 'function'){
      pass('formatTimestamp is a function');
    } else {
      fail(`Expected function, got ${typeof formatTimestamp}`);
    }
  },

  'should format YYYY token': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'YYYY');
    if(result === '2024'){
      pass('YYYY formats correctly');
    } else {
      fail(`Expected '2024', got '${result}'`);
    }
  },

  'should format YY token': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'YY');
    if(result === '24'){
      pass('YY formats correctly');
    } else {
      fail(`Expected '24', got '${result}'`);
    }
  },

  'should format MM token with padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'MM');
    if(result === '06'){
      pass('MM formats correctly with padding');
    } else {
      fail(`Expected '06', got '${result}'`);
    }
  },

  'should format M token without padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'M');
    if(result === '6'){
      pass('M formats correctly without padding');
    } else {
      fail(`Expected '6', got '${result}'`);
    }
  },

  'should format DD token with padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'DD');
    if(result === '15'){
      pass('DD formats correctly');
    } else {
      fail(`Expected '15', got '${result}'`);
    }
  },

  'should format D token without padding': ({pass, fail}) => {
    const ts = new Date(2024, 0, 5).getTime();
    const result = formatTimestamp(ts, 'D');
    if(result === '5'){
      pass('D formats correctly without padding');
    } else {
      fail(`Expected '5', got '${result}'`);
    }
  },

  'should format hh token with padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'hh');
    if(result === '09'){
      pass('hh formats correctly with padding');
    } else {
      fail(`Expected '09', got '${result}'`);
    }
  },

  'should format h token without padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'h');
    if(result === '9'){
      pass('h formats correctly without padding');
    } else {
      fail(`Expected '9', got '${result}'`);
    }
  },

  'should format mm token with padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'mm');
    if(result === '05'){
      pass('mm formats correctly with padding');
    } else {
      fail(`Expected '05', got '${result}'`);
    }
  },

  'should format m token without padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'm');
    if(result === '5'){
      pass('m formats correctly without padding');
    } else {
      fail(`Expected '5', got '${result}'`);
    }
  },

  'should format ss token with padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'ss');
    if(result === '03'){
      pass('ss formats correctly with padding');
    } else {
      fail(`Expected '03', got '${result}'`);
    }
  },

  'should format s token without padding': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 's');
    if(result === '3'){
      pass('s formats correctly without padding');
    } else {
      fail(`Expected '3', got '${result}'`);
    }
  },

  'should format iii token for milliseconds': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'iii');
    if(result === '007'){
      pass('iii formats correctly');
    } else {
      fail(`Expected '007', got '${result}'`);
    }
  },

  'should format complex date string': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'YYYY-MM-DD hh:mm:ss');
    if(result === '2024-06-15 09:05:03'){
      pass('Complex format works correctly');
    } else {
      fail(`Expected '2024-06-15 09:05:03', got '${result}'`);
    }
  },

  'should format with custom separators': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'DD/MM/YYYY');
    if(result === '15/06/2024'){
      pass('Custom separators work correctly');
    } else {
      fail(`Expected '15/06/2024', got '${result}'`);
    }
  },

  'should handle timestamp as string': ({pass, fail}) => {
    const result = formatTimestamp(String(testTimestamp), 'YYYY');
    if(result === '2024'){
      pass('String timestamp handled correctly');
    } else {
      fail(`Expected '2024', got '${result}'`);
    }
  },

  'should return locale string without format': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp);
    if(typeof result === 'string' && result.length > 0){
      pass('Returns locale string without format');
    } else {
      fail(`Expected non-empty string, got '${result}'`);
    }
  },

  'should use forced locale when provided': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, undefined, 'en-US');
    if(typeof result === 'string' && result.length > 0){
      pass('Forced locale works');
    } else {
      fail(`Expected non-empty string, got '${result}'`);
    }
  },

  'should handle midnight timestamp': ({pass, fail}) => {
    const midnight = new Date(2024, 0, 1, 0, 0, 0, 0).getTime();
    const result = formatTimestamp(midnight, 'hh:mm:ss');
    if(result === '00:00:00'){
      pass('Midnight handled correctly');
    } else {
      fail(`Expected '00:00:00', got '${result}'`);
    }
  },

  'should handle end of day timestamp': ({pass, fail}) => {
    const endOfDay = new Date(2024, 0, 1, 23, 59, 59).getTime();
    const result = formatTimestamp(endOfDay, 'hh:mm:ss');
    if(result === '23:59:59'){
      pass('End of day handled correctly');
    } else {
      fail(`Expected '23:59:59', got '${result}'`);
    }
  },

  'should preserve literal text in format': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'Year: YYYY');
    if(result === 'Year: 2024'){
      pass('Literal text preserved');
    } else {
      fail(`Expected 'Year: 2024', got '${result}'`);
    }
  },

  'should handle double-digit month': ({pass, fail}) => {
    const december = new Date(2024, 11, 25).getTime();
    const result = formatTimestamp(december, 'MM');
    if(result === '12'){
      pass('Double-digit month handled correctly');
    } else {
      fail(`Expected '12', got '${result}'`);
    }
  },

  'should format ISO-like date': ({pass, fail}) => {
    const result = formatTimestamp(testTimestamp, 'YYYY-MM-DD');
    if(result === '2024-06-15'){
      pass('ISO-like date format works');
    } else {
      fail(`Expected '2024-06-15', got '${result}'`);
    }
  }
};
