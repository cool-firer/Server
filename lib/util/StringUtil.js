/*
 * 2017/11/23 by jc
 * 
 * 
 */

// 解析adb devices -l 输出
module.exports.parseAdbDevicesList = function (output) {
    /*
     * @param: output adb devices -l的原始输出
     * @return: [{serial, status}]
     */
    var lines = output.split('\n')
    var result = []
    if (lines.length <= 1) {
        return result
    }
    for (var i = 1; i < lines.length; i++) {
        if (lines[i]) {
            var apart = lines[i].split(/\s+/)
            if (apart.length > 1) {
                result.push({
                    serial: apart[0],
                    status: lines[i].indexOf('offline') >= 0 ? 'off' : 'on'
                })
            }
        }
    }
    return result
}