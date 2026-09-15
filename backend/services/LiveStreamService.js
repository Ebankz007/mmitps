const Mux = require('@mux/mux-node');
const ApiServiceManager = require('./ApiServiceManager');
const logger = require('../utils/logger');

class LiveStreamService {
    constructor() {
        this.muxClients = {};
    }

    /**
     * Initializes or retrieves the Mux client based on the current config
     */
    async getMuxClient() {
        const config = await ApiServiceManager.getConfig();
        const livestreamConfig = config.livestream;

        if (livestreamConfig.activeProvider !== 'mux') {
            throw new Error('Mux is not the currently active livestream provider');
        }

        const { tokenId, tokenSecret, status } = livestreamConfig.mux;

        if (status !== 'active') {
            throw new Error('Mux provider is currently inactive in the platform configuration');
        }
        
        if (!tokenId || !tokenSecret) {
            logger.warn('[LiveStreamService] Mux keys not configured. Running in Mock Mode.');
            return null; // Signals mock mode
        }

        // Cache the client so we aren't re-instantiating every call unless keys change
        const cacheKey = `${tokenId}-${tokenSecret}`;
        if (!this.muxClients[cacheKey]) {
            this.muxClients[cacheKey] = new Mux({
                tokenId: tokenId,
                tokenSecret: tokenSecret
            });
        }

        return this.muxClients[cacheKey];
    }

    /**
     * Creates a new Live Stream endpoint for an educator
     */
    async createStream(userId, passthroughData = {}) {
        try {
            const muxClient = await this.getMuxClient();
            
            if (!muxClient) {
                return this.getMockStreamData();
            }

            const stream = await muxClient.video.liveStreams.create({
                playback_policy: ['public'],
                new_asset_settings: { playback_policy: ['public'] },
                reconnect_window: 60, // 60 seconds to reconnect before ending
                passthrough: JSON.stringify({ userId, ...passthroughData }), // Store MMITPS entity IDs
            });

            return {
                streamId: stream.id,
                streamKey: stream.stream_key,
                playbackId: stream.playback_ids[0].id,
                rtmpUrl: 'rtmps://global-live.mux.com:443/app', // Standard global ingest
                status: stream.status
            };
        } catch (error) {
            logger.error(`[LiveStreamService] Create Stream Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Retrieves the status of a specific live stream
     */
    async getStreamStatus(streamId) {
        try {
            const muxClient = await this.getMuxClient();
            
            if (!muxClient) {
                return { status: 'active', active_asset_id: 'mock_asset' };
            }

            const stream = await muxClient.video.liveStreams.retrieve(streamId);
            return {
                status: stream.status, // e.g. "idle", "active"
                active_asset_id: stream.active_asset_id
            };
        } catch (error) {
            logger.error(`[LiveStreamService] Get Stream Status Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Generates standard HLS playback URL
     */
    getPlaybackUrl(playbackId) {
        return `https://stream.mux.com/${playbackId}.m3u8`;
    }

    /**
     * Deletes a stream
     */
    async deleteStream(streamId) {
        try {
            const muxClient = await this.getMuxClient();
            if (muxClient) {
                await muxClient.video.liveStreams.delete(streamId);
            }
            return true;
        } catch (error) {
            logger.error(`[LiveStreamService] Delete Stream Error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Failsafe testing data when credentials aren't active
     */
    getMockStreamData() {
        return {
            streamId: "mock_stream_" + Date.now(),
            streamKey: "mock_key_" + Math.random().toString(36).substring(7),
            playbackId: "qxb01i6T202018GGS", // Sample Mux Big Buck Bunny or similar
            rtmpUrl: "rtmps://mock.global-live.mux.com:443/app",
            status: "idle"
        };
    }
}

module.exports = new LiveStreamService();
