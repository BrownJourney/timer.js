const timer = {
    stored: {},

    _createInnerTimer: function({ tmrId, currentDuration, duration, startReps, isInterval, callback }) {
        let tmrObj;
        
        const durationMs = (startReps === 1 ? currentDuration : duration) * 1000

        if (isInterval) {
            tmrObj = setInterval(() => {
                callback()

                if (startReps !== 0) {
                    this.stored[tmrId].repsLeft -= 1
                    this.stored[tmrId].startTime = Date.now()

                    if (this.stored[tmrId].repsLeft <= 0) {
                        this.remove(tmrId)
                    }
                }
            }, durationMs)
        } else {
            tmrObj = setTimeout(() => {
                this.remove(tmrId)
                callback()
            }, durationMs)
        }

        return tmrObj
    },

    _removeInnerTimer: function(item) {
        const clearFunc = item.isInterval ? clearInterval : clearTimeout
        clearFunc(item.tmrObj)
    },

    /**
     * Creates a timer with the given tmrId, duration, and number of repetitions.
     * If a timer with the given tmrId already exists, it is removed first.
     *
     * @param {string} tmrId a unique id for the timer
     * @param {number} duration the duration of each iteration in seconds
     * @param {number} reps the number of iterations to perform. If set to zero, it will be executed infinite amount of times.
     * @param {function} callback the function to call at each iteration
     */
    create: function(tmrId, duration, reps, callback) {
        if (this.exists(tmrId)) {
            this.remove(tmrId)
        }

        if (typeof callback !== "function") {
            return console.trace()
        }

        const data = {
            tmrId: tmrId,
            startTime: Date.now(),
            startReps: reps,
            duration: duration,
            currentDuration: duration,
            callback: callback,
            isInterval: typeof reps === "number",
            repsLeft: reps
        }
        data.tmrObj = this._createInnerTimer(data)
        
        if (tmrId) {
            this.stored[tmrId] = data
        }
    },

    timeLeft: function(tmrId) {
        if (!this.exists(tmrId)) {
            return 0
        }
        const tmrData = this.stored[tmrId]
        return Math.round((tmrData.startTime + (tmrData.duration * 1000) - Date.now()) / 1000)
    },

    exists: function(tmrId) {
        return typeof this.stored[tmrId] !== "undefined"
    },

    remove: function(tmrId) {
        if (!this.exists(tmrId)) return

        this._removeInnerTimer(this.stored[tmrId])
        delete this.stored[tmrId]
    },

    pause: function(tmrId) {
        if (!this.exists(tmrId)) return

        this.stored[tmrId].currentDuration = (Date.now() - this.stored[tmrId].startTime) / 1000
        this._removeInnerTimer(this.stored[tmrId])
    },

    resume: function(tmrId) {
        if (!this.exists(tmrId)) return
        this.stored[tmrId].startTime = Date.now()
        this.stored[tmrId].tmrObj = this._createInnerTimer(this.stored[tmrId])
    },

    simple: function(duration, callback) {
        this.create(null, duration, null, callback)
    }

}

export default timer;