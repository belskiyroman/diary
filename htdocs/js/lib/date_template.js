Date.prototype._toString = Date.prototype.toString;
Date.prototype.toString = function(format) {
    var self = this;
    var p = function p(s) {
        return (s.toString().length == 1) ? "0" + s : s;
    };
    return format ? format.replace(/dd?d?d?|MM?M?M?|yy?y?y?|hh?|HH?|mm?|ss?|tt?|zz?z?/g, function(format) {
        switch (format) {
            case "hh":
                return p(self.getHours() < 13 ? self.getHours() : (self.getHours() - 12));
            case "h":
                return self.getHours() < 13 ? self.getHours() : (self.getHours() - 12);
            case "HH":
                return p(self.getHours());
            case "H":
                return self.getHours();
            case "mm":
                return p(self.getMinutes());
            case "m":
                return self.getMinutes();
            case "ss":
                return p(self.getSeconds());
            case "s":
                return self.getSeconds();
            case "yyyy":
                return self.getFullYear();
            case "yy":
                return self.getFullYear().toString().substring(2, 4);
            case "dd":
                return p(self.getDate());
            case "d":
                return self.getDate().toString();
            case "MM":
                return p((self.getMonth() + 1));
            case "M":
                return self.getMonth() + 1;
            case "zzz":
            case "zz":
            case "z":
                return "";
        }
    }) : this._toString();
};
