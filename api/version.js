export default function handler(req, res) {
    return res.status(200).json({
        latest: "1.0.3",
        downloadUrl: "https://nolvra.com/downloads/LUXA_v1.pkg",
        changelog: "Initial release"
    });
}
