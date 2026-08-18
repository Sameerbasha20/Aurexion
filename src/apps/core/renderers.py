from rest_framework.renderers import JSONRenderer


class StandardResponseJSONRenderer(JSONRenderer):
    """
    Standardizes all DRF API JSON responses into the format:
    {
        "status": <status_code>,
        "message": "<message>",
        "data": <data_payload>,
        ... <additional_fields>
    }
    """

    def render(self, data, accepted_media_type=None, renderer_context=None):
        response = renderer_context.get("response") if renderer_context else None
        status_code = response.status_code if response else 200

        # Avoid double-wrapping if already structured by custom view
        if (
            isinstance(data, dict)
            and "status" in data
            and "message" in data
            and "data" in data
        ):
            return super().render(data, accepted_media_type, renderer_context)

        message = "Success" if status_code < 400 else "Error"
        additional_fields = {}

        if status_code >= 400:
            payload = None
            if isinstance(data, dict):
                message = (
                    data.get("detail")
                    or data.get("message")
                    or data.get("error")
                    or "An error occurred."
                )
                errors = {k: v for k, v in data.items() if k not in ("detail", "message", "error")}
            else:
                errors = data
        else:
            errors = None
            if isinstance(data, dict) and "results" in data:
                payload = data.get("results")
                for k, v in data.items():
                    if k != "results":
                        additional_fields[k] = v
            else:
                payload = data

        formatted_response = {
            "status": status_code,
            "message": message,
            "data": payload,
            **additional_fields,
        }

        if errors and status_code >= 400:
            formatted_response["errors"] = errors

        return super().render(formatted_response, accepted_media_type, renderer_context)
