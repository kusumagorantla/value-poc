using System.ComponentModel.DataAnnotations;

namespace Jarvis.Traceability.Api.Dtos
{
    public class CreateProcessOperationDto
    {
        [Required]
        public int OperationCode { get; set; }

        [Required]
        public string OperationName { get; set; } = string.Empty;
    }

    public class CreateProcessResultDefinitionDto
    {
        [Required]
        public int ResultCode { get; set; }

        [Required]
        public string ResultName { get; set; } = string.Empty;

        public int ResultType { get; set; } = 1;

        public string Uom { get; set; } = string.Empty;

        public decimal? Nominal { get; set; }

        public decimal? Lsl { get; set; }

        public decimal? Usl { get; set; }

        public bool IsMandatory { get; set; } = true;
    }

    public class ProcessOperationResponseDto
    {
        public Guid Id { get; set; }
        public Guid StepId { get; set; }
        public int OperationCode { get; set; }
        public string OperationName { get; set; } = string.Empty;
        public List<ProcessResultDefinitionResponseDto> ResultDefinitions { get; set; } = new();
    }

    public class ProcessResultDefinitionResponseDto
    {
        public Guid Id { get; set; }
        public Guid OperationId { get; set; }
        public int ResultCode { get; set; }
        public string ResultName { get; set; } = string.Empty;
        public int ResultType { get; set; }
        public string Uom { get; set; } = string.Empty;
        public decimal? Nominal { get; set; }
        public decimal? Lsl { get; set; }
        public decimal? Usl { get; set; }
        public bool IsMandatory { get; set; }
    }
}
