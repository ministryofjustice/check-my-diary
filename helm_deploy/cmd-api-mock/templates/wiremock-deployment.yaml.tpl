
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .Values.wiremock.name }}
  labels:
    app: {{ .Values.wiremock.name }}
spec:
  replicas: {{ .Values.wiremock.replicaCount }}
  selector:
    matchLabels:
      app: {{ .Values.wiremock.name }}
  template:
    metadata:
      labels:
        app: {{ .Values.wiremock.name }}
    spec:
      containers:
        - name: wiremock
          image: "{{ .Values.wiremock.image.repository }}:{{ .Values.wiremock.image.tag }}"
          imagePullPolicy: {{ .Values.wiremock.image.pullPolicy }}
          securityContext:
            {{- toYaml .Values.wiremock.image.securityContext | nindent 12 }}
          args:
            {{- range .Values.wiremock.image.extraArgs }}
            - {{ . | quote }}
            {{- end }}

          ports:
            - name: http
              containerPort: {{ .Values.wiremock.service.port }}
              protocol: TCP
          livenessProbe:
            httpGet:
              path: /__admin/health
              port: {{ .Values.wiremock.service.port }}
              scheme: HTTP
          readinessProbe:
            httpGet:
              path: /__admin/health
              port: {{ .Values.wiremock.service.port }}
              scheme: HTTP

          volumeMounts:
            - name: {{ .Values.wiremock.name }}-stubs
              mountPath: /home/wiremock/mappings

      volumes:
        - name: {{ .Values.wiremock.name }}-stubs
          configMap:
            name: {{ .Values.wiremock.name }}-stubs
