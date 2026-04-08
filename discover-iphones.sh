#!/data/data/com.termux/files/usr/bin/bash
# discover-iphones.sh - Find iPhones and Apple devices on local network

echo "🔍 Scanning local network for Apple devices (iPhones, iPads, Macs)..."
echo ""

# Get local IP and subnet
IP=$(ip route get 1 | awk '{print $NF;exit}')
SUBNET=$(echo $IP | cut -d. -f1-3).0/24

echo "📡 Scanning subnet: $SUBNET"
echo ""

# Run arp-scan and filter Apple OUIs
# Apple OUIs: 00:1A:11, 00:1E:C2, 00:23:32, 00:25:00, 00:26:08, 00:2E:4F, 04:0C:CE, 08:00:07, 10:93:E9, 14:7D:DA, 18:EE:69, 1C:36:BB, 20:41:53, 24:2A:C0, 28:6A:BA, 2C:66:5B, 30:2B:0F, 34:12:98, 34:2E:B7, 38:0B:40, 38:C9:86, 3C:15:C2, 40:6C:8F, 44:2A:60, 48:1C:8E, 4C:1D:9F, 50:1E:5E, 54:AE:27, 58:55:CA, 5C:96:9D, 60:33:4B, 60:FB:42, 64:20:9C, 68:5B:35, 6C:40:8F, 70:3E:AC, 70:56:81, 74:2A:BD, 78:4F:43, 7C:6D:62, 80:BE:05, 84:38:38, 88:53:2E, 8C:29:37, 90:81:58, 94:0A:39, 98:0C:82, 9C:04:EB, A0:2A:9F, A4:B1:E9, A8:2B:B5, AC:7B:A1, B0:0C:4F, B4:7C:5A, B8:09:8A, BC:92:6B, C0:2B:FC, C4:2C:03, C8:2B:2B, CC:20:3B, D0:23:DB, D4:0F:BA, D8:00:4D, DC:2B:2A, E0:3F:49, E4:9A:8F, E8:06:88, EC:35:86, F0:18:98, F4:5C:89, F8:FF:C2, FC:25:3F

arp-scan --localnet --quiet 2>/dev/null | grep -iE "([0-9a-f]{2}:){5}[0-9a-f]{2}" | while read line; do
    MAC=$(echo $line | awk '{print $2}' | tr '[:lower:]' '[:upper:]')
    IP=$(echo $line | awk '{print $1}')
    # Check if MAC matches any Apple OUI prefix
    if echo "$MAC" | grep -qiE "^(00:1A:11|00:1E:C2|00:23:32|00:25:00|00:26:08|00:2E:4F|04:0C:CE|08:00:07|10:93:E9|14:7D:DA|18:EE:69|1C:36:BB|20:41:53|24:2A:C0|28:6A:BA|2C:66:5B|30:2B:0F|34:12:98|34:2E:B7|38:0B:40|38:C9:86|3C:15:C2|40:6C:8F|44:2A:60|48:1C:8E|4C:1D:9F|50:1E:5E|54:AE:27|58:55:CA|5C:96:9D|60:33:4B|60:FB:42|64:20:9C|68:5B:35|6C:40:8F|70:3E:AC|70:56:81|74:2A:BD|78:4F:43|7C:6D:62|80:BE:05|84:38:38|88:53:2E|8C:29:37|90:81:58|94:0A:39|98:0C:82|9C:04:EB|A0:2A:9F|A4:B1:E9|A8:2B:B5|AC:7B:A1|B0:0C:4F|B4:7C:5A|B8:09:8A|BC:92:6B|C0:2B:FC|C4:2C:03|C8:2B:2B|CC:20:3B|D0:23:DB|D4:0F:BA|D8:00:4D|DC:2B:2A|E0:3F:49|E4:9A:8F|E8:06:88|EC:35:86|F0:18:98|F4:5C:89|F8:FF:C2|FC:25:3F)"; then
        echo "🍎 Apple device found: $IP - $MAC"
    fi
done

echo ""
echo "✅ Scan complete."
