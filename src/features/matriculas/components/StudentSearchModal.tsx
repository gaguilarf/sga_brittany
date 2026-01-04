import { useState, useEffect } from "react";
import styles from "./StudentSearchModal.module.css";
import { Student } from "@/features/matriculas/models/EnrollmentModels";
import { StudentService } from "@/shared/services/api/studentService";
import { Search, X, User, IdCard, Loader2 } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (student: Student) => void;
}

export const StudentSearchModal = ({ isOpen, onClose, onSelect }: Props) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
    } else {
      setSearchTerm("");
      setSelectedStudent(null);
    }
  }, [isOpen]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const allStudents = await StudentService.getAll();
      setStudents(allStudents);
      setFilteredStudents([]);
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents([]);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = students.filter(
      (s) =>
        s.nombre.toLowerCase().includes(term) ||
        s.dni?.toLowerCase().includes(term)
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3>Búsqueda de Alumno</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.searchWrapper}>
            <Search className={styles.searchIcon} size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>

          <div className={styles.resultsContainer}>
            {loading ? (
              <div className={styles.emptyState}>
                <Loader2 className={styles.spinner} />
                <p>Cargando alumnos...</p>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className={styles.studentsList}>
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className={`${styles.studentItem} ${
                      selectedStudent?.id === student.id ? styles.selected : ""
                    }`}
                    onClick={() => setSelectedStudent(student)}
                  >
                    <div className={styles.studentInfo}>
                      <span className={styles.studentName}>
                        {student.nombre}
                      </span>
                      <span className={styles.studentDni}>
                        DNI: {student.dni || "N/A"}
                      </span>
                    </div>
                    {selectedStudent?.id === student.id && (
                      <div className={styles.checkIcon}>✓</div>
                    )}
                  </div>
                ))}
              </div>
            ) : searchTerm.trim() !== "" ? (
              <div className={styles.emptyState}>
                <p>No se encontraron resultados para "{searchTerm}"</p>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>Ingrese un nombre o DNI para comenzar la búsqueda</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button
            className={styles.confirmBtn}
            disabled={!selectedStudent}
            onClick={() => selectedStudent && onSelect(selectedStudent)}
          >
            Matricular
          </button>
        </div>
      </div>
    </div>
  );
};
