
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
          args:
            {{- range .Values.wiremock.extraArgs }}
            - {{ . | quote }}
            {{- end }}

          ports:
            - containerPort: {{ .Values.wiremock.service.port }}

          volumeMounts:
            - name: {{ .Values.wiremock.name }}-stubs
              mountPath: /home/wiremock/mappings

      volumes:
        - name: {{ .Values.wiremock.name }}-stubs
          configMap:
            name: {{ .Values.wiremock.name }}-stubs
