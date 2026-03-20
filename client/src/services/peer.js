class PeerService{
    constructor(){
        this.pendingIceCandidates = [];
        if(!this.peer){
            this.peer = new RTCPeerConnection({
                iceServers:[{
                    urls:[
                        'stun:stun.l.google.com:19302',
                        'stun:global.stun.twilio.com:3478',
                    ],
                }],
            });
        }
    }
    async flushPendingIceCandidates(){
        if(!this.peer || !this.peer.remoteDescription){
            return;
        }

        while(this.pendingIceCandidates.length){
            const candidate = this.pendingIceCandidates.shift();
            try {
                await this.peer.addIceCandidate(candidate);
            } catch (err) {
                console.error("Error flushing ICE candidate", err);
            }
        }
    }
    async addIceCandidateSafely(candidate){
        if(!candidate || !this.peer){
            return;
        }

        if(!this.peer.remoteDescription){
            this.pendingIceCandidates.push(candidate);
            return;
        }

        await this.peer.addIceCandidate(candidate);
    }
    async getAnswer(offer){
        if(this.peer){
            await this.peer.setRemoteDescription(offer);
            await this.flushPendingIceCandidates();
            const ans = await this.peer.createAnswer();
            await this.peer.setLocalDescription(ans);
            return ans;
        }
    }
    async setLocalDescription(ans){
        if(this.peer){
            await this.peer.setRemoteDescription(ans);
            await this.flushPendingIceCandidates();
        }
    }
    async getOffer(){
        if(this.peer){
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer);
            return offer;
        }
    }
    createPeer(){
        this.pendingIceCandidates = [];
        this.peer = new RTCPeerConnection({
            iceServers:[{
                urls:[
                    'stun:stun.l.google.com:19302',
                    'stun:global.stun.twilio.com:3478',
                ],
            }],
        });
    }
}
export default new PeerService();