
apiVersion: v1
kind: ConfigMap
metadata:
  name: {{ .Values.wiremock.name }}-stubs-configmap
data:
{{- range $name, $content := .Values.wiremock.stubs }}
  {{ $name }}: |
{{ $content | indent 4 }}
{{- end }}
