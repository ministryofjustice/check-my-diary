{{/* vim: set filetype=mustache: */}}
{{/*
Environment variables for web and worker containers
*/}}
{{- define "deployment.envs" }}
env:
  - name: API_CLIENT_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_ID

  - name: API_CLIENT_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: API_CLIENT_SECRET

  - name: API_AUTH_ENDPOINT_URL
    value: {{ .Values.env.API_AUTH_ENDPOINT_URL | quote }}

  - name: SESSION_SECRET
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: SESSION_SECRET

  - name: TWO_FACT_AUTH_ON
    value: {{ .Values.env.TWO_FACT_AUTH_ON | quote }}

  - name: REJECT_UNAUTHORIZED
    value: {{ .Values.env.REJECT_UNAUTHORIZED | quote }}

  - name: NOTIFY_CLIENT_KEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: NOTIFY_CLIENT_KEY

  - name: CMD_API_URL
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: CMD_API_URL

  - name: NOTIFY_SMS_TEMPLATE
    value: {{ .Values.env.NOTIFY_SMS_TEMPLATE | quote }}

  - name: NOTIFY_EMAIL_TEMPLATE
    value: {{ .Values.env.NOTIFY_EMAIL_TEMPLATE | quote }}

  - name: GOOGLE_ANALYTICS_ID
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: GOOGLE_ANALYTICS_ID

  - name: WEB_SESSION_TIMEOUT_IN_MINUTES
    value: {{ .Values.env.WEB_SESSION_TIMEOUT_IN_MINUTES | quote }}

  - name: "HMPPS_COOKIE_NAME"
    value: {{ template "app.name" . }}

  - name: "HMPPS_COOKIE_DOMAIN"
    value: {{ .Values.ingress.host | quote }}

  - name: "CHECK_MY_DIARY_URL"
    value: https://{{ .Values.ingress.host }}

  - name: "DATABASE_HOST"
    valueFrom:
      secretKeyRef:
        name: check-my-diary-rds
        key: rds_instance_address

  - name: "DATABASE_NAME"
    valueFrom:
      secretKeyRef:
        name: check-my-diary-rds
        key: database_name

  - name: "DATABASE_USER"
    valueFrom:
      secretKeyRef:
        name: check-my-diary-rds
        key: database_username

  - name: "DATABASE_PASSWORD"
    valueFrom:
      secretKeyRef:
        name: check-my-diary-rds
        key: database_password

  - name: DB_SSL_ENABLED
    value: "true"

  - name: REGIONS
    value: {{ .Values.env.REGIONS | quote }}

  - name: QUANTUM_ADDRESS
    value: {{ .Values.env.QUANTUM_ADDRESS | quote }}

  - name: MAINTENANCE_START
    value: {{ .Values.env.MAINTENANCE_START | quote }}

  - name: MAINTENANCE_END
    value: {{ .Values.env.MAINTENANCE_END | quote }}

  - name: APPINSIGHTS_INSTRUMENTATIONKEY
    valueFrom:
      secretKeyRef:
        name: {{ template "app.name" . }}
        key: APPINSIGHTS_INSTRUMENTATIONKEY

{{- end -}}
