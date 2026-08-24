from rest_framework.renderers import JSONRenderer


def _is_already_formatted(data):
    return (
        isinstance(data, dict)
        and "status" in data
        and "message" in data
        and "data" in data
    )


def _build_error_payload(data, status_code):
    if isinstance(data, dict):
        message = (
            data.get("detail")
            or data.get("message")
            or data.get("error")
            or "An error occurred."
        )
        errors = {k: v for k, v in data.items() if k not in ("detail", "message", "error")}
    else:
        message = "Error"
        errors = data

    formatted = {
        "status": status_code,
        "message": message,
        "data": None,
    }
    if errors:
        formatted["errors"] = errors
    return formatted


def _build_success_payload(data, status_code):
    additional_fields = {}
    if isinstance(data, dict) and "results" in data:
        payload = data.get("results")
        for k, v in data.items():
            if k != "results":
                additional_fields[k] = v
    else:
        payload = data

    return {
        "status": status_code,
        "message": "Success",
        "data": payload,
        **additional_fields,
    }


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
        if _is_already_formatted(data):
            return super().render(data, accepted_media_type, renderer_context)

        response = renderer_context.get("response") if renderer_context else None
        status_code = response.status_code if response else 200

        if status_code >= 400:
            formatted_response = _build_error_payload(data, status_code)
        else:
            formatted_response = _build_success_payload(data, status_code)

        return super().render(formatted_response, accepted_media_type, renderer_context)
