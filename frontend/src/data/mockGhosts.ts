
export interface Ghost {
    id: string;
    name: string;
    category: string;
    dangerLevel: number; // 0-100
    locations: string[];
    description: string;
    abilities: string[];
    weaknesses: string[];
    videoUrl: string; // YouTube
    videoThumbnail: string; // YouTube Thumbnail
    imageUrl: string; // High Quality Transparent PNG
    stats: {
        strength: number;
        speed: number;
        stealth: number;
    }
}

export const MOCK_GHOSTS: Ghost[] = [
    {
        id: "G-001",
        name: "DEMON",
        category: "EXTREME AGGRESSION",
        dangerLevel: 95,
        locations: ["Ridgeview Court", "Tanglewood Drive"],
        description: "Demons are the most aggressive ghosts we've ever encountered. Known to attack without provocation, they will hunt more often than any other spirit. A Demon's weakness is the Crucifix, which they fear greatly.",
        abilities: ["Frequent Hunts", "Early Attack Threshold (70% Sanity)", "Rapid Cooldown"],
        weaknesses: ["Crucifix (Increased Range)", "Smudge Stick"],
        videoUrl: "https://www.youtube.com/watch?v=QA3gPaaB92U",
        videoThumbnail: "https://img.youtube.com/vi/QA3gPaaB92U/maxresdefault.jpg",
        imageUrl: "/images/ghosts/demon.png", // Aggressive Skull/Entity
        stats: {
            strength: 100,
            speed: 85,
            stealth: 20
        }
    },
    {
        id: "G-002",
        name: "REVENANT",
        category: "VENGEFUL SPIRIT",
        dangerLevel: 90,
        locations: ["Bleasdale Farmhouse", "Grafton Farmhouse"],
        description: "A slow, violent ghost that attacks indiscriminately. However, they are deceptively fast when hunting. Hiding from a Revenant will cause it to move slowly, but if it spots you, it will travel at incredible speeds.",
        abilities: ["High Velocity Pursuit", "Line-of-Sight Speed Boost"],
        weaknesses: ["Hiding (Significantly Slows Movement)"],
        videoUrl: "https://www.youtube.com/watch?v=E_MjTz7k4Ps",
        videoThumbnail: "https://img.youtube.com/vi/E_MjTz7k4Ps/maxresdefault.jpg", // Revenant Gameplay
        imageUrl: "/images/ghosts/revenant.png", // Scary hooded figure
        stats: {
            strength: 90,
            speed: 95,
            stealth: 40
        }
    },
    {
        id: "G-003",
        name: "BANSHEE",
        category: "STALKING OMEN",
        dangerLevel: 80,
        locations: ["Willow Street", "Edgefield Road"],
        description: "A natural hunter that will single out one investigator at a time. It will stalk its prey before initiating a hunt. Banshees can be heard wailing with a Parabolic Microphone.",
        abilities: ["Target Fixation", "Teleportation to Target", "Banshee Scream"],
        weaknesses: ["Crucifix (Higher Effectiveness)", "Parabolic Mic evidence"],
        videoUrl: "https://www.youtube.com/watch?v=JJb4e6K8VlU",
        videoThumbnail: "https://img.youtube.com/vi/JJb4e6K8VlU/hqdefault.jpg",
        imageUrl: "/images/ghosts/banshee.png", // Floating spectral woman
        stats: {
            strength: 75,
            speed: 60,
            stealth: 90
        }
    },
    {
        id: "G-004",
        name: "POLTERGEIST",
        category: "NOISY POLTERGEIST",
        dangerLevel: 60,
        locations: ["Sunny Meadows", "Prison"],
        description: "One of the most famous ghosts, the Poltergeist loves to manipulate the environment around it. It can throw multiple objects at once to lower your sanity.",
        abilities: ["Multi-Throw", "Sanity Drain via Throws", "Object Manipulation"],
        weaknesses: ["Empty Rooms (Powerless without items)"],
        videoUrl: "https://www.youtube.com/watch?v=m7H8jDwZt5k",
        videoThumbnail: "https://img.youtube.com/vi/m7H8jDwZt5k/maxresdefault.jpg",
        imageUrl: "/images/ghosts/poltergeist.png", // Chaotic skeleton/spirit
        stats: {
            strength: 50,
            speed: 60,
            stealth: 30
        }
    },
    {
        id: "G-005",
        name: "WRAITH",
        category: "FLOATING SPECTER",
        dangerLevel: 70,
        locations: ["Maple Lodge Campsite", "Woodwind"],
        description: "One of the most dangerous ghosts you will find. It is the only known ghost that has the ability of flight and has sometimes been known to travel through walls.",
        abilities: ["Flight", "Wall Phasing", "No Footsteps"],
        weaknesses: ["Salt (Toxic Reaction)"],
        videoUrl: "https://www.youtube.com/watch?v=bC1WfA2_h48",
        videoThumbnail: "https://img.youtube.com/vi/bC1WfA2_h48/maxresdefault.jpg",
        imageUrl: "/images/ghosts/wraith.png", // Classic floating ghost
        stats: {
            strength: 65,
            speed: 70,
            stealth: 85
        }
    }
];
