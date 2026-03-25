
apiVersion: v1
kind: Service
metadata:
  name: {{ .Values.wiremock.name }}
spec:
  type: {{ .Values.wiremock.service.type }}
  ports:
    - port: {{ .Values.wiremock.service.externalPort }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    app: {{ .Values.wiremock.name }}
