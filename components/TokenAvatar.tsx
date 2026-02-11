import React, { useState, useEffect } from 'react';

const GATEWAYS = [
    'https://olive-defensive-giraffe-83.mypinata.cloud/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
    'https://ipfs.io/ipfs/',
];

// ── Global cache: uri → resolved image URL ───────────────
const imageCache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string | null>>();

/**
 * Extract CID from ipfs:// URI
 */
const getCid = (uri: string): string => {
    if (uri.startsWith('ipfs://')) return uri.slice(7);
    return uri;
};

/**
 * Convert ipfs:// to HTTPS gateway URL (using first gateway for resolved images)
 */
const ipfsToHttp = (uri: string): string => {
    if (uri.startsWith('ipfs://')) return GATEWAYS[0] + uri.slice(7);
    if (uri.startsWith('https://') || uri.startsWith('http://')) return uri;
    return GATEWAYS[0] + uri;
};

/**
 * Fetch metadata JSON from IPFS, trying multiple gateways.
 * Extract the image URL from the metadata.
 */
const resolveImageFromMetadata = async (uri: string): Promise<string | null> => {
    const cid = getCid(uri);

    for (const gateway of GATEWAYS) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 4000);

            const res = await fetch(gateway + cid, { signal: controller.signal });
            clearTimeout(timeout);

            if (!res.ok) continue;

            const text = await res.text();

            try {
                const json = JSON.parse(text);
                // Found metadata — extract image CID and return direct gateway URL
                const imgUri = json.image || json.imageUrl || json.img;
                if (imgUri) {
                    const imgCid = getCid(imgUri);
                    // Return the image URL using the SAME gateway that worked for metadata
                    return gateway + imgCid;
                }
            } catch {
                // Not JSON — maybe it IS the image directly
                return gateway + cid;
            }
        } catch {
            continue; // try next gateway
        }
    }

    return null;
};

/**
 * Resolve with deduplication
 */
const resolveImage = (uri: string): Promise<string | null> => {
    if (imageCache.has(uri)) return Promise.resolve(imageCache.get(uri)!);

    let pending = pendingFetches.get(uri);
    if (!pending) {
        pending = resolveImageFromMetadata(uri).then((url) => {
            if (url) imageCache.set(uri, url);
            pendingFetches.delete(uri);
            return url;
        });
        pendingFetches.set(uri, pending);
    }
    return pending;
};

// ── Component ────────────────────────────────────────────

interface TokenAvatarProps {
    uri: string;
    name: string;
    symbol: string;
    size?: number;
    className?: string;
}

const TokenAvatar: React.FC<TokenAvatarProps> = ({
    uri,
    name,
    symbol,
    size = 40,
    className = '',
}) => {
    const [imageUrl, setImageUrl] = useState<string | null>(imageCache.get(uri) ?? null);
    const [failed, setFailed] = useState(false);

    const letter = (symbol || name || '?')[0].toUpperCase();
    const hash = (name + symbol).split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    const colors = ['#4ADE80', '#FCD34D', '#EA580C', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#EF4444'];
    const bgColor = colors[hash % colors.length];

    useEffect(() => {
        if (!uri || imageUrl) return;

        resolveImage(uri).then((url) => {
            if (url) setImageUrl(url);
        });
    }, [uri]);

    if (imageUrl && !failed) {
        return (
            <div
                className={`relative overflow-hidden flex-shrink-0 ${className}`}
                style={{ width: size, height: size, backgroundColor: bgColor }}
            >
                <img
                    src={imageUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => setFailed(true)}
                />
            </div>
        );
    }

    return (
        <div
            className={`flex items-center justify-center flex-shrink-0 ${className}`}
            style={{ width: size, height: size, backgroundColor: bgColor }}
        >
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: size * 0.4 }}>
                {letter}
            </span>
        </div>
    );
};

export default TokenAvatar;
