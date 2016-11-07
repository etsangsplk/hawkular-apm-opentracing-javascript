/*
 * Copyright 2015-2016 Red Hat, Inc. and/or its affiliates
 * and other contributors as indicated by the @author tags.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import roi from 'roi';

const CONSOLE_RECORDER = Symbol('CONSOLE_RECORDER');

class NoOpRecorder {
    record() {
    }
}

class ConsoleRecorder extends NoOpRecorder {
    record(span) {
        console.log(JSON.stringify({
            traceId: span.getTraceId(),
            parentId: span.getParentId(),
            spanId: span.getId(),

            operationName: span.getOperationName(),
            startTime: span.getStartTime(),
            duration: span.getDuration(),
            logs: span.getLogs(),
            tags: span.getTags(),
        }));
    }
}

class HttpRecorder {
    constructor(url, username, password, debug) {
        this._options = {
            endpoint: `${url}/hawkular/apm/traces/fragments`,
            username,
            password,
        };

        if (debug) {
            this[CONSOLE_RECORDER] = new ConsoleRecorder();
        }
    }

    record(span) {
        if (!span) {
            return;
        }

        const trace = span.context().getTrace().fromSpan(span);
        roi.post(this._options, [trace]);

        if (this[CONSOLE_RECORDER]) {
            this[CONSOLE_RECORDER].record(span);
        }
    }
}

module.exports = {
    NoOpRecorder,
    ConsoleRecorder,
    HttpRecorder,
};