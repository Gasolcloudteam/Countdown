// 选择启用动态取色功能或自动颜色调整
const useDynamicColor = true; // 若不需要动态取色，改为 false
const useLocalTime = false; // 若要使用本地时间，改为 true；否则使用服务器时间

// 获取服务器时间并更新倒计时
function fetchServerTime() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://worldtimeapi.org/api/timezone/Asia/Shanghai', true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            var response = JSON.parse(xhr.responseText);
            var serverTime = new Date(response.utc_datetime);
            updateCountdown(serverTime);
        } else {
            console.error('Error fetching server time:', xhr.status);
        }
    };
    xhr.send();
}

function padZero(num) {
    return num < 10 ? '0' + num : num;
}

function updateCountdown(time) {
    var today = time || new Date();
    var currentYear = today.getFullYear();
    var examDateStart = new Date(currentYear, 5, 7); // 6月7日，月份从0开始计数
    var examDateEnd = new Date(currentYear, 5, 9); // 6月9日
    var nextYearExamDate = new Date(currentYear + 1, 5, 7); // 下一年的高考日期

    if (today >= examDateStart && today <= examDateEnd) {
        document.getElementById("countdown").style.display = "none";
        document.getElementById("greeting").style.display = "block";
        document.getElementById("greeting").innerText = "祝同学们旗开得胜，金榜题名！";
        document.getElementById("examStatus").innerText = "高考进行中";
    } else {
        document.getElementById("greeting").style.display = "none";
        document.getElementById("countdown").style.display = "block";
        var timeDiff = examDateStart - today;
        if (today > examDateEnd) {
            timeDiff = nextYearExamDate - today;
            currentYear++;
        }
        var days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        var hours = padZero(Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
        var minutes = padZero(Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60)));
        var seconds = padZero(Math.floor((timeDiff % (1000 * 60)) / 1000));

        document.getElementById("days").innerText = days;
        document.getElementById("hours").innerText = hours;
        document.getElementById("minutes").innerText = minutes;
        document.getElementById("seconds").innerText = seconds;
        document.getElementById("year").innerText = currentYear;
        document.getElementById("examStatus").innerHTML = `距离 <span class="dynamic-color">${currentYear}</span> 年高考还有 <span class="dynamic-color">${days}</span> 天`;
    }
}

function fetchHitokoto() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://v1.hitokoto.cn/', true);
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            var response = JSON.parse(xhr.responseText);
            document.getElementById("hitokoto").innerText = response.hitokoto + " -- " + response.from;
        } else {
            console.error('Error fetching hitokoto:', xhr.status);
        }
    };
    xhr.send();
}

function setAutoColor() {
    const elements = document.querySelectorAll('.auto-color');
    elements.forEach(el => {
        const rgb = getAverageRGB(document.body);
        const yiq = ((rgb.r*299)+(rgb.g*587)+(rgb.b*114))/1000;
        el.style.color = (yiq >= 128) ? 'black' : 'white';
    });
}

function getAverageRGB(imgEl) {
    var blockSize = 5, // 取样间隔
        defaultRGB = {r:255,g:255,b:255}, // 默认白色
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;

    if (!context) {
        return defaultRGB;
    }

    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

    context.drawImage(imgEl, 0, 0);

    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        return defaultRGB;
    }

    length = data.data.length;

    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }

    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);

    return rgb;
}

function initCountdown() {
    if (useLocalTime) {
        updateCountdown(new Date());
        setInterval(() => updateCountdown(new Date()), 1000);
    } else {
        fetchServerTime();
        setInterval(fetchServerTime, 1000);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    // 获取时间并更新倒计时
    initCountdown();

    // 获取一言
    fetchHitokoto();
    setInterval(fetchHitokoto, 3600000);

    // 动态设置字体颜色
    if (useDynamicColor) {
        document.querySelectorAll('.dynamic-color').forEach(el => el.classList.add('dynamic-color'));
    } else {
        setAutoColor();
    }
});