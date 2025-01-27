const banglaNumbers = {
    '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
    '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯'
};

const banglaWeekdays = {
    0: 'রবিবার',
    1: 'সোমবার',
    2: 'মঙ্গলবার',
    3: 'বুধবার',
    4: 'বৃহস্পতিবার',
    5: 'শুক্রবার',
    6: 'শনিবার'
};

const banglaMonths = {
    0: 'জানুয়ারি',
    1: 'ফেব্রুয়ারি',
    2: 'মার্চ',
    3: 'এপ্রিল',
    4: 'মে',
    5: 'জুন',
    6: 'জুলাই',
    7: 'আগস্ট',
    8: 'সেপ্টেম্বর',
    9: 'অক্টোবর',
    10: 'নভেম্বর',
    11: 'ডিসেম্বর'
};

const banglaTimePhases = {
    night: 'রাত',
    morning: 'সকাল',
    noon: 'দুপুর',
    afternoon: 'বিকাল',
    evening: 'সন্ধ্যা'
};

function toBanglaNumber(number) {
    return number.toString().replace(/[0-9]/g, digit => banglaNumbers[digit]);
}

function getTimePhase(hours) {
    if (hours >= 0 && hours < 4) return banglaTimePhases.night;      // রাত (12 AM - 4 AM)
    if (hours >= 4 && hours < 11) return banglaTimePhases.morning;   // সকাল (4 AM - 11 AM)
    if (hours >= 11 && hours < 15) return banglaTimePhases.noon;     // দুপুর (11 AM - 3 PM)
    if (hours >= 15 && hours < 18) return banglaTimePhases.afternoon;// বিকাল (3 PM - 6 PM)
    if (hours >= 18 && hours < 20) return banglaTimePhases.evening;  // সন্ধ্যা (6 PM - 8 PM)
    return banglaTimePhases.night;                                   // রাত (8 PM - 12 AM)
}

function formatTimeToBangla(date) {
    const weekday = banglaWeekdays[date.getDay()];
    const day = toBanglaNumber(date.getDate());
    const month = banglaMonths[date.getMonth()];
    const year = toBanglaNumber(date.getFullYear());
    
    let hours = date.getHours();
    const timePhase = getTimePhase(hours);
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    const banglaHours = toBanglaNumber(hours);
    const minutes = toBanglaNumber(date.getMinutes().toString().padStart(2, '0'));

    return `আজ ${weekday}, ${day} ${month} ${year} | সময় ${timePhase} ${banglaHours}টা ${minutes} মিনিট`;
}

function updateDateTime() {
    const now = new Date();
    const formattedTime = formatTimeToBangla(now);
    document.getElementById('currentDateTime').textContent = formattedTime;
}

setInterval(updateDateTime, 60000); // Update every minute
document.addEventListener('DOMContentLoaded', updateDateTime);