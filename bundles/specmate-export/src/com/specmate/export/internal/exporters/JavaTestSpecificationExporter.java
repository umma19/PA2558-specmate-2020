package com.specmate.export.internal.exporters;

import static com.specmate.export.internal.exporters.ExportUtil.replaceInvalidChars;

import java.util.List;

import org.osgi.service.component.annotations.Component;

import com.specmate.export.api.IExporter;
import com.specmate.model.testspecification.ParameterAssignment;
import com.specmate.model.testspecification.TestCase;
import com.specmate.model.testspecification.TestParameter;
import com.specmate.model.testspecification.TestSpecification;

/** Exports a test specification to java */
@Component(immediate = true, service = IExporter.class)
public class JavaTestSpecificationExporter extends TestSpecificationExporterBase {

	public JavaTestSpecificationExporter() {
		super("Java");
	}

	@Override
	protected String generateFileName(TestSpecification testSpecification) {
		return getClassName(testSpecification) + ".java";
	}

	private String getClassName(TestSpecification testSpecification) {
		String tsName = testSpecification.getName();
		if (tsName == null) {
			tsName = "";
		}
		return replaceInvalidChars(tsName) + "Test";
	}

	@Override
	protected void generateHeader(StringBuilder sb, TestSpecification testSpecification,
			List<TestParameter> parameters) {
		sb.append("import org.junit.Test;\n");
		sb.append("import org.junit.Assert;\n\n");
		appendDateComment(sb);
		sb.append("public class ");
		sb.append(getClassName(testSpecification));
		sb.append(" {\n\n");
	}

	@Override
	protected void generateTestCaseFooter(StringBuilder sb, TestCase tc) {
		sb.append("() {\n");
		sb.append("\t\tAssert.throw();\n");
		sb.append("\t}\n\n");
	}

	@Override
	protected void generateTestCaseHeader(StringBuilder sb, TestSpecification ts, TestCase tc) {
		sb.append("\t/*\n");
		sb.append("\t * Testfall: ");
		sb.append(tc.getName());
		sb.append("\n\t */\n");
		sb.append("\t@Test\n");
		sb.append("\tpublic void ");
		sb.append(getClassName(ts));
	}

	@Override
	protected void generateFooter(StringBuilder sb, TestSpecification testSpecification) {
		sb.append("}");
	}

	@Override
	protected void generateTestCaseParameterAssignments(StringBuilder sb, List<ParameterAssignment> assignments,
			List<TestParameter> parameters) {
		for (ParameterAssignment pAssignment : assignments) {
			appendParameterValue(sb, pAssignment);
		}
	}

	@Override
	public String getProjectName() {
		return null;
	}

	@Override
	public void setProjectName(String project) {
	}
}
